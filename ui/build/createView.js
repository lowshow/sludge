import { atr, el, lstn, mnt, cls } from "./dom.js";
import { btnClass, toast, row, col12 } from "./atoms.js";
import { onDiff } from "./state.js";
import { aStreamSel } from "./stream.js";
import { View } from "./view.js";
export function createViewGen({ state: { getState, updateState, subscribe } }) {
    const back = el("button", {
        attr: {
            textContent: "Back to list",
            className: btnClass("btn-large")
        }
    });
    lstn(back)
        .on("click")
        .do(() => {
        updateState({ view: View.list });
    });
    const create = atr(el("button")).map([
        ["textContent", "Create new stream"],
        ["className", btnClass("btn-large")]
    ]);
    lstn(create)
        .on("click")
        .do(() => {
        updateState({ createStream: true });
    });
    const input = atr(el("input")).map([
        ["type", "url"],
        ["className", "white-text validate"]
    ]);
    subscribe((oldState) => {
        onDiff({
            current: getState(),
            previous: oldState,
            selector: aStreamSel
        }).do((value) => {
            input.value = value;
        });
    });
    const add = mnt(cls(el("form"))("form"))([
        input,
        atr(el("button")).map([
            ["type", "submit"],
            ["textContent", "Submit"],
            ["className", btnClass("btn")]
        ])
    ]);
    lstn(input)
        .on("invalid")
        .do(() => {
        if (!input.validity.valid) {
            toast(input.validationMessage);
            return;
        }
    });
    lstn(add)
        .on("submit")
        .do((event) => {
        event.preventDefault();
        if (getState().streams.findIndex((stream) => stream.admin === input.value) > -1) {
            toast("Stream already added.");
            return;
        }
        updateState({ addStream: input.value });
    });
    return mnt(el("div"))([
        row(col12(create)),
        row(col12(atr(el("h6")).map([["textContent", "or add existing stream:"]]))),
        row(col12(add)),
        row(col12(back))
    ]);
}
