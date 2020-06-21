import { streamGen, StreamData } from "./stream.js"
import { el, mnt, atr } from "./dom.js"
import { initState, StateFns } from "./state.js"
import { View, views } from "./view.js"
import { HubData, hubGen } from "./hub.js"
import { storage } from "./storage.js"
import { addBtnGen } from "./addBtn.js"
import { headerGen } from "./header.js"

export enum Mode {
    dummy = "dummy",
    debug = "debug",
    test = "test",
    live = "live"
}

export interface State {
    view: View
    addStream: string
    createStream: boolean
    addHub: string
    rmHub: string
    mode: Mode
    streams: StreamData[]
    hubs: { [index: number]: HubData[] }
    viewStreamIndex: number
    streamUI: string
    clickedCloud: boolean
}

export type SFn = StateFns<State>

export function modeSel(state: State): Mode {
    return state.mode
}

function viewContainer(): HTMLDivElement {
    return atr(el("div")).map([["className", "container rootInner"]])
}

export function main({
    container,
    mode,
    streamUI
}: {
    container: HTMLElement
    mode: Mode
    streamUI: string
}): void {
    const state: SFn = initState<State>({
        view: View.empty,
        addStream: "",
        createStream: false,
        addHub: "",
        rmHub: "",
        mode,
        streams: [],
        hubs: {},
        viewStreamIndex: -1,
        streamUI,
        clickedCloud: false
    })

    const viewWrap: HTMLDivElement = viewContainer()

    mnt(container)([
        headerGen({ state }),
        viewWrap,
        addBtnGen({
            state
        })
    ])

    views({
        state,
        container: viewWrap
    })

    streamGen({ state })

    hubGen({ state })

    storage({ state })()
}
