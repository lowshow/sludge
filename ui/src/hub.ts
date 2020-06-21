import { SFn, State, Mode } from "./main.js"
import { onDiff } from "./state.js"
import { err } from "./errors.js"
import { View } from "./view.js"
import { dummyHubDataURL } from "./dummyData.js"
import { StreamData, vStreamsSel, selectedStream } from "./stream.js"
import { validateHubDataArray } from "./validate.js"

export interface HubData {
    id: string
    url: string
}

export function vHubsSel(state: State): HubData[] {
    return state.hubs[state.viewStreamIndex] || []
}

export function hubsSel(state: State): { [index: number]: HubData[] } {
    return state.hubs
}

export function aHubSel(state: State): string {
    return state.addHub
}

export function rmHubSel(state: State): string {
    return state.rmHub
}

function getHubs({ state }: { state: SFn; reload?: boolean }): void {
    const { getState, updateState }: SFn = state
    const s: State = getState()
    const { mode }: State = s

    const selected: StreamData = selectedStream(s)
    const isLive: boolean = mode === Mode.live
    const url: string = isLive ? selected.hub : dummyHubDataURL.next().value

    fetch(url)
        .then((data: Response): Promise<any> => data.json())
        .then(validateHubDataArray)
        .then((data: HubData[]): void => {
            const { viewStreamIndex, hubs }: State = getState()

            updateState({
                hubs: {
                    ...hubs,
                    [viewStreamIndex]: data
                }
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

function add({ state }: { state: SFn }): void {
    const { getState, updateState }: SFn = state
    const s: State = getState()
    const { mode, addHub }: State = s

    if (!addHub) return

    try {
        new URL(addHub).toString()
    } catch (e) {
        err(e)
        return
    }

    const selected: StreamData = selectedStream(s)

    updateState({ addHub: "" })

    const isLive: boolean = mode === Mode.live
    const url: string = isLive ? selected.admin : dummyHubDataURL.next().value
    const options: RequestInit = isLive
        ? { method: "PUT", body: addHub }
        : { method: "GET" }
    fetch(url, options)
        .then((): void => {
            getHubs({ state })
        })
        .catch((error: Error): void => {
            if (error.name === "TypeError") {
                error.name = "NetworkError"
            }
            err({ error, debug: !isLive })
        })
}

function rm({ state }: { state: SFn }): void {
    const { getState, updateState }: SFn = state
    const s: State = getState()
    const { mode, rmHub }: State = s
    if (!rmHub) return

    const selected: StreamData = selectedStream(s)

    updateState({ rmHub: "" })

    const isLive: boolean = mode === Mode.live
    const url: string = isLive ? selected.admin : dummyHubDataURL.next().value
    const options: RequestInit = isLive
        ? { method: "DELETE", body: rmHub }
        : { method: "GET" }

    fetch(url, options)
        .then((): void => {
            getHubs({ state })
        })
        .catch((error: Error): void => {
            if (error.name === "TypeError") {
                error.name = "NetworkError"
            }
            err({ error, debug: !isLive })
        })
}

export function hubGen({ state }: { state: SFn }): void {
    const { getState, subscribe }: SFn = state
    // add hub -> from user provided hub url
    // get hubs -> stream-hub url
    // delete hub -> id returned from hub url req
    subscribe((oldState: State): void => {
        const current: State = getState()

        onDiff({
            current,
            previous: oldState,
            selector: aHubSel
        }).do((): void => add({ state }))

        onDiff({
            current,
            previous: oldState,
            selector: rmHubSel
        }).do((): void => rm({ state }))

        onDiff({
            current,
            previous: oldState,
            selector: vStreamsSel
        }).do((index: number): void => {
            if (!current.hubs[index]?.length) {
                getHubs({ state })
            }
        })
    })
}
