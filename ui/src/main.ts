import { streamGen, StreamData } from "./stream.js"
import { el, mnt, atr, lstn } from "./dom.js"
import { initState, StateFns, onDiff } from "./state.js"
import { View, views, viewSel } from "./view.js"
import { addBtn } from "./atoms.js"

export enum Mode {
    dummy,
    debug,
    test,
    live
}

export interface State {
    view: View
    addStream: string
    createStream: boolean
    mode: Mode
    streams: StreamData[]
    hubs: { [index: string]: string[] }
}

export type SFn = StateFns<State>

export function modeSel(state: State): Mode {
    return state.mode
}

function viewContainer(): HTMLDivElement {
    return atr(el("div")).map([["className", "container rootInner"]])
}

function addBtnGen({
    state: { updateState, getState, subscribe }
}: {
    state: SFn
}): HTMLDivElement {
    const btn: HTMLButtonElement = atr(addBtn()).prop("id")("addBtn")
    const tapTarget: HTMLDivElement = atr(el("div")).map([
        ["className", "tap-target blue darken-4"]
    ])
    tapTarget.dataset.target = "addBtn"

    const wrap: HTMLDivElement = mnt(
        atr(
            el("div", (): void => {
                M.TapTarget.init(tapTarget, {
                    onClose: (): void => {
                        updateState({ view: View.create })
                        M.TapTarget.getInstance(tapTarget).destroy()
                    }
                }).open()
            })
        ).map([["className", "fixed-action-btn"]])
    )([btn, tapTarget])

    mnt(tapTarget)(
        mnt(atr(el("div")).prop("className")("tap-target-content"))([
            atr(el("p")).map([
                [
                    "textContent",
                    "Add a stream by clicking this button. You will have the option to create a new stream or add an existing stream."
                ]
            ])
        ])
    )

    lstn(btn)
        .on("click")
        .do((): void => {
            updateState({ view: View.create })
        })

    subscribe((oldState: State): void => {
        onDiff({
            current: getState(),
            previous: oldState,
            selector: viewSel
        }).do((view: View): void => {
            if (view === View.create) {
                btn.classList.add("scale-out")
            } else {
                btn.classList.remove("scale-out")
            }
        })
    })

    return wrap
}

export function main({ container }: { container: HTMLElement }): void {
    const state: SFn = initState<State>({
        view: View.empty,
        addStream: "",
        createStream: false,
        mode: Mode.dummy,
        streams: [],
        hubs: {}
    })
    const viewWrap: HTMLDivElement = viewContainer()
    mnt(container)([
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
}
