import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone"

dayjs.extend(timezone);
dayjs.extend(utc);
export const getDateDifferenceHumanized = (dateFrom: Date | string, DateTo: Date | string) => {
    const date1 = dayjs(dateFrom)
    const date2 = dayjs(DateTo)

    const msDiff = date1.diff(date2, 'ms');
    if (msDiff < 1000) {
        return `${msDiff} ms`
    }
    const sDiff = date1.diff(date2, 's');
    if (sDiff < 60) {
        return `${sDiff} second${sDiff == 1 ? '' : 's'}`

    }
    const mDiff = date1.diff(date2, 'm');
    if (mDiff < 60) {
        return `${mDiff} minute${sDiff == 1 ? '' : 's'}`
    }
    const hDiff = date1.diff(date2, 'hour');
    if (hDiff < 24) {
        return `${hDiff} hour${sDiff == 1 ? '' : 's'} `
    }

    const dDiff = date1.diff(date2, 'd');
    return `${dDiff} day${sDiff == 1 ? '' : 's'}`


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