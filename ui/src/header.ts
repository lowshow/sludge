import { F } from "./interfaces.js"
import { el, lstn, mnt, atr, cls } from "./dom.js"
import { btnClass } from "./atoms.js"
import { SFn, State } from "./main.js"
import { onDiff } from "./state.js"
import { streamsSel, StreamData } from "./stream.js"

function ccSel(state: State): boolean {
    return state.clickedCloud
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

export function headerGen({
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

    subscribe((previous: State): void => {
        const current: State = getState()
        onDiff({
            current,
            previous,
            selector: streamsSel
        }).do((streams: StreamData[]): void => {
            if (streams.length) {
                btn.classList.remove("scale-out")
            }
        })
        onDiff({
            current,
            previous,
            selector: ccSel
        }).do((state: boolean): void => {
            if (state) btn.classList.remove("pulse")
            else btn.classList.add("pulse")
        })
    })

    return nav
}
