import { streamGen } from "./stream.js";
import { el, mnt, atr, lstn } from "./dom.js";
import { initState, onDiff } from "./state.js";
import { View, views, viewSel } from "./view.js";
import { addBtn } from "./atoms.js";
export var Mode;
(function (Mode) {
    Mode[Mode["dummy"] = 0] = "dummy";
    Mode[Mode["debug"] = 1] = "debug";
    Mode[Mode["test"] = 2] = "test";
    Mode[Mode["live"] = 3] = "live";
})(Mode || (Mode = {}));
export function modeSel(state) {
    return state.mode;
}
function viewContainer() {
    return atr(el("div")).map([["className", "container rootInner"]]);
}
function addBtnGen({ state: { updateState, getState, subscribe } }) {
    const btn = atr(addBtn()).prop("id")("addBtn");
    const tapTarget = atr(el("div")).map([
        ["className", "tap-target blue darken-4"]
    ]);
    tapTarget.dataset.target = "addBtn";
    const wrap = mnt(atr(el("div", () => {
        M.TapTarget.init(tapTarget, {
            onClose: () => {
                updateState({ view: View.create });
                M.TapTarget.getInstance(tapTarget).destroy();
            }
        }).open();
    })).map([["className", "fixed-action-btn"]]))([btn, tapTarget]);
    mnt(tapTarget)(mnt(atr(el("div")).prop("className")("tap-target-content"))([
        atr(el("p")).map([
            [
                "textContent",
                "Add a stream by clicking this button. You will have the option to create a new stream or add an existing stream."
            ]
        ])
    ]));
    lstn(btn)
        .on("click")
        .do(() => {
        updateState({ view: View.create });
    });
    subscribe((oldState) => {
        onDiff({
            current: getState(),
            previous: oldState,
            selector: viewSel
        }).do((view) => {
            if (view === View.create) {
                btn.classList.add("scale-out");
            }
            else {
                btn.classList.remove("scale-out");
            }
        });
    });
    return wrap;
}
export function main({ container }) {
    const state = initState({
        view: View.empty,
        addStream: "",
        createStream: false,
        mode: Mode.dummy,
        streams: [],
        hubs: {}
    });
    const viewWrap = viewContainer();
    mnt(container)([
        viewWrap,
        addBtnGen({
            state
        })
    ]);
    views({
        state,
        container: viewWrap
    });
    streamGen({ state });
}
