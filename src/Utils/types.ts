
interface Trail {
    _id?: string
    trainer?: string
    dogName: string
    handlerName?: string
    distance?: number
    location?: string
    duration?: number
    notes?: string
    trailType?: string
    startType?: string
    date: Date
    locationCoordinate?: [number, number],
    dogTrace?: any,
    runnerTrace?: any,
}
export type {  Trail };
