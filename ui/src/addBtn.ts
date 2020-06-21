import { SFn, State } from "./main.js"
import { atr, el, mnt, lstn } from "./dom.js"
import { addBtn } from "./atoms.js"
import { View, viewSel } from "./view.js"
import { onDiff } from "./state.js"
import { streamsSel, StreamData } from "./stream.js"

export function addBtnGen({
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

    subscribe((previous: State): void => {
        const current: State = getState()
        onDiff({
            current,
            previous,
            selector: viewSel
        }).do((view: View): void => {
            if (view === View.create) {
                btn.classList.add("scale-out")
            } else {
                btn.classList.remove("scale-out")
            }
        })
        onDiff({
            current,
            previous,
            selector: streamsSel
        }).do((streams: StreamData[]): void => {
            if (streams.length) {
                const instance: M.TapTarget = M.TapTarget.getInstance(tapTarget)
                if (instance.isOpen) {
                    instance.close()
                }
            }
        })
    })

    return wrap
}
