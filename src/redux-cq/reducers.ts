import { CqAction } from "./actions";
import { EntityModel, denormalize, S, DependencyTable, EntityRefCollection, jsRef, normalizeArray, mergeEntities, mergeEntityRefs, uniqueEntityRefs, removeEntities } from "./core";


const cloneDeps = (deps:DependencyTable) => {
    let clone:DependencyTable = { }
    for (const type in deps) {
        clone[type] = { }
        for (const key in deps[type]) {
            clone[type][key] = {
                ...deps[type][key]
            }
        }
    }
    return clone;
}

const addDeps = (deps:DependencyTable, viewSeq:string, entities:EntityRefCollection) => {
    let moreDeps = cloneDeps(deps);
    for (const type in entities) {
        for (const key in entities[type]) {
            moreDeps[type][key] = {
                ...moreDeps[type][key],
                [viewSeq]: true
            }
        }
    }
    return moreDeps;
}

const viewsByEntities = (deps: DependencyTable, entities:EntityRefCollection) => 
    Object.fromEntries(
        Object.keys(entities)
            .flatMap((type) => 
                Object.keys(entities[type])
                    .filter(key => (deps[type] && deps[type][key]))
                    .flatMap(key => Object.entries(deps[type][key]))));

const orphanEntities = (deps: DependencyTable) => (
    Object.fromEntries(
        Object.entries(deps).map(([type, data]) => [
            type, 
            Object.fromEntries(
                Object.entries(data)
                    .filter(([_, viewSeqs]) => Object.keys(viewSeqs).length < 1)
                    .map(([key, _]) => [key, true]))
        ])));

const removeDepEntities = (deps:DependencyTable, entities:EntityRefCollection) => {
    const newEntries = Object.entries(deps)
        .map(([type, keys]) => [
            type, 
            Object.fromEntries(Object.entries(keys).filter(([key, _]) => entities[type] && entities[type][key]))
        ]);
    return Object.fromEntries(newEntries);
}

const removeDepView = (deps:DependencyTable,  viewSeq:string):DependencyTable => {
    const newEntries = Object.entries(deps)
        .map(([type, keys]) => [
            type, 
            Object.fromEntries(Object.entries(keys).map(([key, { [viewSeq]:_, ...rest }]) => [key, rest]))
        ]);
    return Object.fromEntries(newEntries);
}

export const createCqReducer = <TModel extends EntityModel>(entityModel: TModel) => {

    const sInit:S<TModel> = {
        entities: { },
        views: { },
        deps: { }
    }

    return (s:S<TModel> = sInit, action:CqAction<TModel>):S<TModel> => {

        if (action.type === "CQ/QUERY-RUN") {
            return {
                ...s,
                views: {
                    ...s.views,
                    [action.viewSeq]: {
                        ...s.views[action.viewSeq],
                        pending: true,
                        lastCreatedReq: action.request
                    }
                }
            }
        }
 
        if (action.type === "CQ/QUERY-SUCCESS") {
            if (action.viewSeq in s.views) { // only if the receiving view is mounted
                // normalize payload
                const [rootKeys, updates] = normalizeArray(entityModel, action.data, jsRef(action.rootEntity));
                // denormalize data again to ensure consistency
                const data = denormalize(entityModel, s.entities, rootKeys, [jsRef(action.rootEntity)], action.maxDepth) as any;
                return {
                    ...s,
                    deps: addDeps(s.deps, action.viewSeq, uniqueEntityRefs(updates)),
                    entities: mergeEntities(s.entities, updates),
                    views: {
                        ...s.views,
                        [action.viewSeq]: {
                            ...s.views[action.viewSeq],
                            rootKeys: rootKeys !== null ? rootKeys as string[] : [], 
                            pending: false,
                            lastError: null,
                            lastErrorType: null,
                            data,
                            lastHandledReq: action.request as any,
                            rootEntity: action.rootEntity as any,
                            maxDepth: action.maxDepth,
                            total: action.total
                        }
                    }
                }
            }
        }

        if (action.type === "CQ/VIEW-UNMOUNT") {
            const { [action.viewSeq]:_, ...views } = s.views;
            // remove view from dependency table
            const depsWithOrphanEntities = removeDepView(s.deps, action.viewSeq);
            // remove entities that aren't referenced by any view
            const orphans = orphanEntities(depsWithOrphanEntities);
            const entities = removeEntities(s.entities, orphans);
            const deps = removeDepEntities(depsWithOrphanEntities, orphans);
            // updated state
            return { ...s, views, deps, entities };
        }

        if (action.type === "CQ/DATA-SYNC") {
            const { created, modified, deleted } = action.changes;
            const entities = removeEntities(mergeEntities(mergeEntities(s.entities, created), modified), deleted);
            // determine dependent views
            const depViews = viewsByEntities(s.deps, mergeEntityRefs(
                uniqueEntityRefs(created), 
                uniqueEntityRefs(modified), 
                deleted));
            // remove deps
            const deps = removeDepEntities(s.deps, deleted);
            // denormalize views
            const viewEntries = Object.entries(s.views).filter(([viewSeq, view]) => 
                (viewSeq in depViews)
                ? { }
                : { ...view, data: denormalize(entityModel, entities, view.rootKeys, jsRef(view.rootEntity), view.maxDepth) });
            const views = Object.fromEntries(viewEntries);
            return {
                ...s,
                deps,
                views,
                entities
            };
        }

        if (action.type === "CQ/QUERY-ERROR") {
            if (action.viewSeq in s.views) {
                return {
                    ...s,
                    views: {
                        ...s.views,
                        [action.viewSeq]: {
                            ...s.views[action.viewSeq],
                            pending: false,
                            lastError: action.error,
                            lastErrorType: action.errorType
                        }
                    }
                };
            }
        }

        return s;
    }

}