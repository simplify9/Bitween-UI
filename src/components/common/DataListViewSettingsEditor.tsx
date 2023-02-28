import Tab from "./forms/Tab"
import {Icon} from "./icons"
import {useMemo} from "react";


export type SortBy = {
    field: string
    descending?: boolean
}

export type DataListViewSettings = {
    limit: number
    offset: number
    //  sortBy: SortBy
}

export type DataListViewSettingsChangeEvent = DataListViewSettings & {}

interface Props {
    total: number
    limit: number
    offset: number
    onChange: (e: DataListViewSettingsChangeEvent) => void
}

export const DataListViewSettingsEditor: React.FC<Props> = ({
                                                                offset,
                                                                limit,
                                                                total,
                                                                onChange
                                                            }) => {


    const {pages, totalPages, pageIndex} = useMemo(() => {
        const _pageIndex = Math.floor(offset / limit);
        const _totalPages = Math.ceil(total / limit);
        const _pages = []
        for (let i = 0; i < _totalPages; ++i) _pages.push(i);

        return {pages: _pages, pageIndex: _pageIndex, totalPages: _totalPages}
    }, [offset, limit]);

    const handlePageChange = (newOffset: number) => {
        if (newOffset < 0 || newOffset >= total)
            return

        onChange({
            limit,
            offset: newOffset,
          //  sortBy: sortBy
        })
    }

    return (

        <div className="w-full flex py-1 my-3">
            <div className="text-sm py-1">Total&nbsp;
                <strong>{total}</strong>
                &nbsp;records
                {totalPages > 1
                    ?
                    <span>, showing (<strong>{offset + 1}</strong> - <strong>{Math.min(total, offset + limit)}</strong>)</span>
                    : null}
            </div>
            {totalPages > 1
                ? <>
                    <Tab onClick={() => handlePageChange(0)} key="ll"><Icon shape="chevronDoubleLeft" className="h-2"/></Tab>
                    <Tab key="l" onClick={() => handlePageChange((pageIndex - 1) * limit)}><Icon shape="chevronLeft"
                                                                                                 className="h-2"/></Tab>
                    {pages.map(p => {
                        return p >= (pageIndex - 2) && p <= (pageIndex + 2) ? (
                            <Tab key={`page${p}`} onClick={() => handlePageChange(p * limit)}
                                 selected={p === pageIndex}>{p + 1}</Tab>) : null
                    })}
                    <Tab key="r" onClick={() => handlePageChange((pageIndex + 1) * limit)}><Icon shape="chevronRight"
                                                                                                 className="h-2"/></Tab>
                    <Tab onClick={() => {
                        handlePageChange(pages.slice(-1)[0] * limit)
                    }} key="rr"><Icon shape="chevronDoubleRight"
                                      className="h-2"/></Tab>
                </>
                : null}
        </div>

    );
}
