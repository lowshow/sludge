import { Maybe } from "./interfaces.js"
import { onDiff } from "./state.js"
import { State, Mode, SFn } from "./main.js"
import { dummyStreamDataURL } from "./dummyData.js"
import { View } from "./view.js"
import { err } from "./errors.js"

export interface StreamData {
    streamUI: string
    stream: string
    playlist: string
    hub: string
}

function cStreamSel(state: State): boolean {
    return state.createStream
}

export function aStreamSel(state: State): string {
    return state.addStream
}

export function streamsSel(state: State): StreamData[] {
    return state.streams
}

function parseData(data: Maybe<StreamData>): StreamData {
    const idMatch: string =
        "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"

    const match: StreamData = {
        streamUI: "url",
        stream: idMatch,
        playlist: idMatch,
        hub: `${idMatch}\/hubs`
    }

    if (typeof data !== "object") {
        throw Error("Invalid data")
    }

    return (Object.keys(match) as (keyof StreamData)[]).reduce(
        (prev: StreamData, curr: keyof StreamData): StreamData => {
            if (curr in data) {
                if (match[curr] === "url") {
                    try {
                        new URL(data[curr]).toString()
                        prev[curr] = data[curr]
                        return prev
                    } catch {
                        throw Error(`Data invalid ${curr}`)
                    }
                } else if (data[curr].match(match[curr]) !== null) {
                    prev[curr] = data[curr]
                    return prev
                }
                throw Error(`Data invalid ${curr}`)
            }
            throw Error(`Data missing ${curr}`)
        },
        match
    )
}

function getStream({
    isLive,
    options,
    state: { getState, updateState },
    url
}: {
    url: string
    options: RequestInit
    state: SFn
    isLive: boolean
}): void {
    fetch(url, options)
        .then((data: Response): Promise<any> => data.json())
        .then(parseData)
        .then((data: StreamData): void => {
            const streams: StreamData[] = [...getState().streams, data]
            updateState({ view: View.list, streams })
        })
        .catch((error: Error): void => {
            updateState({ view: View.list })
            if (error.name === "TypeError") {
                error.name = "NetworkError"
            }
            err({ error, debug: !isLive })
        })
}

function create({ state }: { state: SFn }): void {
    const { getState, updateState }: SFn = state
    const { mode, createStream }: State = getState()
    if (!createStream) return
    // set stream to loading page
    updateState({ view: View.loading, createStream: false })
    const isLive: boolean = mode === Mode.live
    const url: string = isLive ? "/stream" : dummyStreamDataURL()
    const options: RequestInit = { method: isLive ? "POST" : "GET" }
    getStream({ url, options, isLive, state })
}

function add({ state }: { state: SFn }): void {
    const { getState, updateState }: SFn = state
    const { mode, addStream }: State = getState()
    if (!addStream) return
    try {
        new URL(addStream).toString()
    } catch (e) {
        err(e)
        return
    }
    // set stream to loading page
    updateState({ view: View.loading, addStream: "" })
    const isLive: boolean = mode === Mode.live
    const url: string = isLive ? addStream : dummyStreamDataURL()
    getStream({ isLive, options: {}, state, url })
}

export function streamGen({ state }: { state: SFn }): void {
    const { getState, subscribe }: SFn = state
    subscribe((oldState: State): void => {
        onDiff({
            current: getState(),
            previous: oldState,
            selector: cStreamSel
        }).do((): void => create({ state }))

        onDiff({
            current: getState(),
            previous: oldState,
            selector: aStreamSel
        }).do((): void => add({ state }))
    })
}
