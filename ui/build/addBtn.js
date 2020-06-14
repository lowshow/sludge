import { atr, el, mnt, lstn } from "./dom.js";
import { addBtn } from "./atoms.js";
import { View, viewSel } from "./view.js";
import { onDiff } from "./state.js";
import { streamsSel } from "./stream.js";
export function addBtnGen({ state: { updateState, getState, subscribe } }) {
    const btn = atr(addBtn()).prop("id")("addBtn");
    const tapTarget = atr(el("div")).map([
        ["className", "tap-target blue darken-4"]
    ]);
    tapTarget.dataset.target = "addBtn";
    const onMount = () => {
        M.TapTarget.init(tapTarget, {
            onClose: () => {
                updateState({ view: View.create });
                M.TapTarget.getInstance(tapTarget).destroy();
            }
        }).open();
    };
    const wrap = mnt(atr(el("div", { onMount })).map([["className", "fixed-action-btn"]]))([btn, tapTarget]);
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
    subscribe((previous) => {
        const current = getState();
        onDiff({
            current,
            previous,
            selector: viewSel
        }).do((view) => {
            if (view === View.create) {
                btn.classList.add("scale-out");
            }
            else {
                btn.classList.remove("scale-out");
            }
        });
        onDiff({
            current,
            previous,
            selector: streamsSel
        }).do((streams) => {
            if (streams.length) {
                const instance = M.TapTarget.getInstance(tapTarget);
                if (instance.isOpen) {
                    instance.close();
                }
            }
        });
    });
    return wrap;
}
