import { streamGen } from "./stream.js";
import { el, mnt, atr } from "./dom.js";
import { initState } from "./state.js";
import { View, views } from "./view.js";
import { hubGen } from "./hub.js";
import { storage } from "./storage.js";
import { addBtnGen } from "./addBtn.js";
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
        // headerGen({ state }),
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
    storage({ state })();
}
