import { onDiff } from "./state.js";
import { emt, el, mnt, atr } from "./dom.js";
import { row, col12, loader } from "./atoms.js";
import { createViewGen } from "./createView.js";
import { listViewGen } from "./listView.js";
export var View;
(function (View) {
    View[View["create"] = 0] = "create";
    View[View["empty"] = 1] = "empty";
    View[View["list"] = 2] = "list";
    View[View["loading"] = 3] = "loading";
})(View || (View = {}));
export function viewSel(state) {
    return state.view;
}
function emptyViewGen() {
    // Add Stream
    // From existing input/button
    // Create new stream
    return row(col12(atr(el("p")).map([["textContent", "You have no streams."]])));
}
function loadingViewGen() {
    return row(col12(loader()));
}
export function views({ container, state }) {
    const { getState, subscribe, updateState } = state;
    const set = mnt(container);
    const createView = createViewGen({
        state
    });
    const emptyView = emptyViewGen();
    const loadingView = loadingViewGen();
    const listView = listViewGen({ state });
    setView(View.empty);
    function setView(view) {
        emt(container);
        switch (view) {
            case View.create:
                set(createView);
                break;
            case View.empty:
                set(emptyView);
                break;
            case View.list:
                // if list state is empty, go to empty page
                if (getState().streams.length) {
                    set(listView);
                }
                else {
                    updateState({ view: View.empty });
                }
                break;
            case View.loading:
                set(loadingView);
                break;
        }
    }
    subscribe((oldState) => {
        onDiff({
            current: getState(),
            previous: oldState,
            selector: viewSel
        }).do(setView);
    });
}
