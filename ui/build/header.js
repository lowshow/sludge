import { el, lstn, mnt, atr, cls } from "./dom.js";
import { btnClass } from "./atoms.js";
import { onDiff } from "./state.js";
import { streamsSel } from "./stream.js";
function ccSel(state) {
    return state.clickedCloud;
}
function modalGen({ onContinue, onDismiss }) {
    const continueBtn = el("button", {
        attr: { textContent: "Continue", className: btnClass("") }
    });
    const dismissBtn = el("button", {
        attr: { textContent: "Dismiss", className: btnClass("") }
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
    return mnt(el("div", { attr: { id: "modal1", className: "modal dark300" } }))([
        mnt(el("div", { attr: { className: "modal-content" } }))(el("p", {
            attr: {
                textContent: "This button opens a window that allows you to record live audio from your device and send it directly to your streams."
            }
        })),
        mnt(el("div", {
            attr: { className: "modal-footer dark300 btn-group" }
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
export function headerGen({ state: { subscribe, getState, updateState } }) {
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
    });
    const onMount = () => {
        M.Modal.init(modal);
    };
    const nav = mnt(cls(el("div", { onMount }))("navbar-fixed"))([
        mnt(el("nav"))(mnt(cls(el("div"))(["nav-wrapper", "spaced", "dark300"]))([
            cls(el("figure"))("logo"),
            mnt(atr(el("ul")).prop("id")("nav-mobile"))(mnt(el("li"))(btn))
        ])),
        modal
    ]);
    subscribe((previous) => {
        const current = getState();
        onDiff({
            current,
            previous,
            selector: streamsSel
        }).do((streams) => {
            if (streams.length) {
                btn.classList.remove("scale-out");
            }
        });
        onDiff({
            current,
            previous,
            selector: ccSel
        }).do((state) => {
            if (state)
                btn.classList.remove("pulse");
            else
                btn.classList.add("pulse");
        });
    });
    return nav;
}
