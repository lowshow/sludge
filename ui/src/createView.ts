import { SFn, State } from "./main.js"
import { atr, el, lstn, mnt, cls } from "./dom.js"
import { btnClass, toast, row, col12 } from "./atoms.js"
import { onDiff } from "./state.js"
import { aStreamSel } from "./stream.js"

export function createViewGen({
    state: { getState, updateState, subscribe }
}: {
    state: SFn
}): HTMLDivElement {
    const create: HTMLButtonElement = atr(el("button")).map([
        ["textContent", "Create new stream"],
        ["className", btnClass("btn-large")]
    ])

    lstn(create)
        .on("click")
        .do((): void => {
            updateState({ createStream: true })
        })

    const input: HTMLInputElement = atr(el("input")).map([
        ["type", "url"],
        ["className", "white-text validate"]
    ])

    subscribe((oldState: State): void => {
        onDiff({
            current: getState(),
            previous: oldState,
            selector: aStreamSel
        }).do((value: string): void => {
            input.value = value
        })
    })

    const add: HTMLFormElement = mnt(cls(el("form"))("form"))([
        input,
        atr(el("button")).map([
            ["type", "submit"],
            ["textContent", "Submit"],
            ["className", btnClass("btn")]
        ])
    ])

    lstn(input)
        .on("invalid")
        .do((): void => {
            if (!input.validity.valid) {
                toast(input.validationMessage)
                return
            }
        })

    lstn(add)
        .on("submit")
        .do((event: Event): void => {
            event.preventDefault()
            updateState({ addStream: input.value })
        })

    return mnt(el("div"))([
        row(col12(create)),
        row(
            col12(
                atr(el("h6")).map([["textContent", "or add existing stream:"]])
            )
        ),
        row(col12(add))
    ])
}
