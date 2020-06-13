import { streamGen, StreamData, streamsSel } from "./stream.js"
import { el, mnt, atr, lstn, cls } from "./dom.js"
import { initState, StateFns, onDiff } from "./state.js"
import { View, views, viewSel } from "./view.js"
import { addBtn, btnClass } from "./atoms.js"
import { HubData, hubGen } from "./hub.js"
import { F } from "./interfaces.js"

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

    const onMount = (): void => {
        M.TapTarget.init(tapTarget, {
            onClose: (): void => {
                updateState({ view: View.create })
                M.TapTarget.getInstance(tapTarget).destroy()
            }
        }).open()
    }

    const wrap: HTMLDivElement = mnt(
        atr(el("div", { onMount })).map([["className", "fixed-action-btn"]])
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

function modalGen({
    onContinue,
    onDismiss
}: {
    onContinue: F<void, void>
    onDismiss: F<void, void>
}): HTMLDivElement {
    const continueBtn: HTMLButtonElement = el("button", {
        attr: { textContent: "Continue", className: btnClass("btn") }
    })
    const dismissBtn: HTMLButtonElement = el("button", {
        attr: { textContent: "Dismiss", className: btnClass("btn") }
    })

    lstn(continueBtn)
        .on("click")
        .do((): void => {
            onContinue()
        })
    lstn(dismissBtn)
        .on("click")
        .do((): void => {
            onDismiss()
        })

    return mnt(el("div", { attr: { id: "modal1", className: "modal black" } }))(
        [
            mnt(el("div", { attr: { className: "modal-content" } }))(
                el("p", {
                    attr: {
                        textContent:
                            "This button opens a window that allows you to record live audio from your device and send it directly to your streams."
                    }
                })
            ),
            mnt(
                el("div", {
                    attr: { className: "modal-footer black btn-group" }
                })
            )([continueBtn, dismissBtn])
        ]
    )
}

function headerBtn(streamUI: string): HTMLAnchorElement {
    return mnt(
        el("a", {
            attr: {
                href: streamUI,
                target: "_blank",
                className: btnClass(
                    "btn-floating scale-transition scale-out pulse"
                )
            }
        })
    )(
        atr(el("i")).obj({
            className: "material-icons black-text",
            textContent: "cloud_upload"
        })
    )
}

function headerGen({
    state: { subscribe, getState, updateState }
}: {
    state: SFn
}): HTMLDivElement {
    // when there are more than 1 stream, make this visible
    // pulse until clicked
    // clicking first time opens modal explaining next page
    // modal contains button to continue to open stream, or close modal
    // stop pulse and modal after first click
    const btn: HTMLAnchorElement = headerBtn(getState().streamUI)
    const modal: HTMLDivElement = modalGen({
        onContinue: (): void => {
            M.Modal.getInstance(modal).close()
            window.open(getState().streamUI)
        },
        onDismiss: (): void => {
            M.Modal.getInstance(modal).close()
        }
    })

    lstn(btn)
        .on("click")
        .do((event: Event): void => {
            if (getState().clickedCloud) return
            event.preventDefault()
            M.Modal.getInstance(modal).open()
            updateState({ clickedCloud: true })
            btn.classList.remove("pulse")
        })

    const onMount: F<void, void> = (): void => {
        M.Modal.init(modal)
    }

    const nav: HTMLDivElement = mnt(
        cls(el("div", { onMount }))("navbar-fixed")
    )([
        mnt(el("nav"))(
            mnt(cls(el("div"))(["nav-wrapper", "spaced", "black"]))([
                cls(el("figure"))("logo"),
                mnt(atr(el("ul")).prop("id")("nav-mobile"))(mnt(el("li"))(btn))
            ])
        ),
        modal
    ])

    subscribe((oldState: State): void => {
        const current: State = getState()
        onDiff({
            current,
            previous: oldState,
            selector: streamsSel
        }).do((streams: StreamData[]): void => {
            if (streams.length) {
                btn.classList.remove("scale-out")
            }
        })
    })

    return nav
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
}
