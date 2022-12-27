import dayjs from "dayjs";

export const getDateDifference = (dateFrom: Date | string, DateTo: Date | string, unit?: "hours" | "seconds" | "ms") => {
    const date1 = dayjs(dateFrom)
    const date2 = dayjs(DateTo)
    const diffUnit = unit ?? "ms"
    return `${ date1.diff(date2, diffUnit)} ${diffUnit}`

}