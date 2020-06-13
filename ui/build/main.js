import { streamGen, streamsSel } from "./stream.js";
import { el, mnt, atr, lstn, cls } from "./dom.js";
import { initState, onDiff } from "./state.js";
import { View, views, viewSel } from "./view.js";
import { addBtn, btnClass } from "./atoms.js";
import { hubGen } from "./hub.js";
export var Mode;
(function (Mode) {
    Mode["dummy"] = "dummy";
    Mode["debug"] = "debug";
    Mode["test"] = "test";
    Mode["live"] = "live";
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
function modalGen({ onContinue, onDismiss }) {
    const continueBtn = el("button", {
        attr: { textContent: "Continue", className: btnClass("btn") }
    });
    const dismissBtn = el("button", {
        attr: { textContent: "Dismiss", className: btnClass("btn") }
    });
    lstn(continueBtn)
        .on("click")
        .do(() => {
        onContinue();
    });
    lstn(dismissBtn)
        .on("click")
        .do(() => {
        onDismiss();
    });
    return mnt(el("div", { attr: { id: "modal1", className: "modal black" } }))([
        mnt(el("div", { attr: { className: "modal-content" } }))(el("p", {
            attr: {
                textContent: "This button opens a window that allows you to record live audio from your device and send it directly to your streams."
            }
        })),
        mnt(el("div", {
            attr: { className: "modal-footer black btn-group" }
        }))([continueBtn, dismissBtn])
    ]);
}
function headerBtn(streamUI) {
    return mnt(el("a", {
        attr: {
            href: streamUI,
            target: "_blank",
            className: btnClass("btn-floating scale-transition scale-out pulse")
        }
    }))(atr(el("i")).obj({
        className: "material-icons black-text",
        textContent: "cloud_upload"
    }));
}
function headerGen({ state: { subscribe, getState, updateState } }) {
    // when there are more than 1 stream, make this visible
    // pulse until clicked
    // clicking first time opens modal explaining next page
    // modal contains button to continue to open stream, or close modal
    // stop pulse and modal after first click
    const btn = headerBtn(getState().streamUI);
    const modal = modalGen({
        onContinue: () => {
            M.Modal.getInstance(modal).close();
            window.open(getState().streamUI);
        },
        onDismiss: () => {
            M.Modal.getInstance(modal).close();
        }
    });
    lstn(btn)
        .on("click")
        .do((event) => {
        if (getState().clickedCloud)
            return;
        event.preventDefault();
        M.Modal.getInstance(modal).open();
        updateState({ clickedCloud: true });
        btn.classList.remove("pulse");
    });
    const onMount = () => {
        M.Modal.init(modal);
    };
    const nav = mnt(cls(el("div", { onMount }))("navbar-fixed"))([
        mnt(el("nav"))(mnt(cls(el("div"))(["nav-wrapper", "spaced", "black"]))([
            cls(el("figure"))("logo"),
            mnt(atr(el("ul")).prop("id")("nav-mobile"))(mnt(el("li"))(btn))
        ])),
        modal
    ]);
    subscribe((oldState) => {
        const current = getState();
        onDiff({
            current,
            previous: oldState,
            selector: streamsSel
        }).do((streams) => {
            if (streams.length) {
                btn.classList.remove("scale-out");
            }
        });
    });
    return nav;
}
export function main({ container, mode, streamUI }) {
    const state = initState({
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
    });
    const viewWrap = viewContainer();
    mnt(container)([
        headerGen({ state }),
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
    hubGen({ state });
}
