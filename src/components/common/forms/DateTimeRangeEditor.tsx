import React from "react";


export type DateTimeRange = {
    from?: string
    to?: string
}

interface CalendarState {
    month: number
    year: number
}

interface State {
    from: CalendarState
    to: CalendarState
}

interface Props {
    dateTimeFormat?: string
    value?: DateTimeRange
    onChange?: (newValue: DateTimeRange) => void
}
