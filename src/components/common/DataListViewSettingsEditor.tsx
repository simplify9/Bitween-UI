import Tab from "./forms/Tab"
import {Icon} from "./icons"
import React, {useMemo} from "react";
import ChoiceEditor from "src/components/common/forms/ChoiceEditor";
import {OrderBy} from "src/client";
import {KeyValuePair} from "@/src/types/common";


export type DataListViewSettings = {
    limit: number
    offset: number
    orderBy?: OrderBy
}


interface Props {
    total: number
    limit: number
    offset: number
    orderBy?: OrderBy
    orderByFields?: KeyValuePair[]
    onChange: (e: DataListViewSettings) => void
}

export const DataListViewSettingsEditor: React.FC<Props> = ({
                                                                offset,
                                                                limit,
                                                                total,
                                                                onChange,
                                                                orderBy,
                                                                orderByFields
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
            return;

        onChange({
            limit,
            offset: newOffset,
            orderBy
        })
    }

    const handleSortChange = (orderBy: string) => {


        onChange({
            limit,
            offset,
            orderBy: {
                field: orderBy
            }
        })
    }
    const limitOptions = [10,20, 100, 200, 500].map(n => ({ key: n.toString(), value: n }));

    return (
        <div className="w-full flex py-1 my-3 px-3 items-center overflow-scroll">
            <div className="text-sm py-1">Total&nbsp;
                <strong>{total}</strong>
                {" "}records
                {totalPages > 1
                    ?
                    <span>, showing (<strong>{offset + 1}</strong> - <strong>{Math.min(total, offset + limit)}</strong>)</span>
                    : null}
            </div>

            <Tab onClick={() => handlePageChange(0)} key="ll">
                <Icon shape="chevronDoubleLeft" className="h-2"/>
            </Tab>

            <Tab key="l" onClick={() => handlePageChange((pageIndex - 1) * limit)}>
                <Icon shape="chevronLeft" className="h-2"/>
            </Tab>

            {pages.map(p => {
                return p >= (pageIndex - 2) && p <= (pageIndex + 2) ? (
                    <Tab key={`page${p}`} onClick={() => handlePageChange(p * limit)}
                         selected={p === pageIndex}>
                        {p + 1}
                    </Tab>) : null
            })}

            <Tab key="r" onClick={() => handlePageChange((pageIndex + 1) * limit)}>
                <Icon shape="chevronRight" className="h-2"/>
            </Tab>

            <Tab key="rr" onClick={() => {
                handlePageChange(pages.slice(-1)[0] * limit)
            }}>
                <Icon shape="chevronDoubleRight" className="h-2"/>
            </Tab>
            {
                orderByFields && <div className={"mx-3 "}>
                    <ChoiceEditor value={orderBy?.field} onChange={handleSortChange} menuPlacement={"top"}
                                  placeholder={"Order By"} options={orderByFields}
                                  optionValue={option => option.value} optionTitle={option => option.key}
                    />
                </div>
            }
            <div className={"mx-3"}>
                <ChoiceEditor
                    value={limit}
                    onChange={newLimit => onChange({ limit: newLimit, offset: 0, orderBy })}
                    menuPlacement={"top"}
                    placeholder={"Limit"}
                    isClearable={false}
                    options={limitOptions}
                    optionValue={option => option.value}
                    optionTitle={option => option.key}
                />
            </div>


        </div>

    );
}
