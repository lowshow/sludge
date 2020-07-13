import { SFn, State } from "./main.js"
import { F } from "./interfaces.js"
import { onDiff } from "./state.js"
import { streamsSel, StreamData } from "./stream.js"
import { validateState } from "./validate.js"

export type StoreInit = F<void, void>

function setStreamsStore(streams: string[]): void {
    localStorage.setItem("streams", JSON.stringify(streams))
}

function getStateStore(): State | undefined {
    try {
        const state: string | null = localStorage.getItem("state")
        if (!state) return undefined
        return validateState(JSON.parse(state))
    } catch {
        return undefined
    }
}

function setStateStore(state: State): void {
    localStorage.setItem("state", JSON.stringify(state))
}

export function storage({
    state: { getState, subscribe, updateState }
}: {
    state: SFn
}): StoreInit {
    subscribe((previous: State): void => {
        const current: State = getState()
        setStateStore(current)
        onDiff({
            current,
            previous,
            selector: streamsSel
        }).do((streams: StreamData[]): void => {
            setStreamsStore(
                streams.map((stream: StreamData): string => stream.admin)
            )
        })
    })
    return (): void => {
        const state: State | undefined = getStateStore()
        if (!state) return
        updateState({ ...state, viewStreamIndex: state.streams.length - 1 })
    }
}
