import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone"

dayjs.extend(timezone);
dayjs.extend(utc);
export const getDateDifference = (dateFrom: Date | string, DateTo: Date | string, unit?: "hours" | "seconds" | "ms") => {
    const date1 = dayjs(dateFrom)
    const date2 = dayjs(DateTo)
    const diffUnit = unit ?? "ms"
    return `${date1.diff(date2, diffUnit)} ${diffUnit}`

}
export const toLocalDateTimeString = (date: any) => {
    if (!date) {
        return "  -  "
    }
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    let a = dayjs(date)
    a.tz(timeZone)
    return a.format('YYYY/MM/DD, hh:mm a');

}