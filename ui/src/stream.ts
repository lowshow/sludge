import { Maybe } from "./interfaces.js"
import { onDiff } from "./state.js"
import { State, Mode, SFn } from "./main.js"
import { dummyStreamDataURL } from "./dummyData.js"
import { View } from "./view.js"
import { err } from "./errors.js"

export interface StreamData {
    admin: string
    download: string
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

export function vStreamsSel(state: State): number {
    return state.viewStreamIndex
}

export function selectedStream(state: State): StreamData {
    return streamsSel(state)[vStreamsSel(state)]
}

function parseData(data: Maybe<StreamData>): StreamData {
    if (typeof data !== "object") {
        throw Error("Invalid data")
    }

    try {
        new URL(data.admin).toString()
        new URL(data.download).toString()
        new URL(data.hub).toString()
    } catch {
        throw Error("Invalid data")
    }

    return data
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
            updateState({
                view: View.list,
                streams,
                viewStreamIndex: streams.length - 1
            })
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
    const url: string = isLive ? "/stream" : dummyStreamDataURL.next().value
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
    const url: string = isLive ? addStream : dummyStreamDataURL.next().value
    getStream({ isLive, options: {}, state, url })
}

export function streamGen({ state }: { state: SFn }): void {
    const { getState, subscribe }: SFn = state

    subscribe((oldState: State): void => {
        const current: State = getState()

        onDiff({
            current,
            previous: oldState,
            selector: cStreamSel
        }).do((): void => create({ state }))

        onDiff({
            current,
            previous: oldState,
            selector: aStreamSel
        }).do((): void => add({ state }))
    })
}
