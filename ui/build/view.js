import { onDiff } from "./state.js";
import { emt, el, mnt, atr } from "./dom.js";
import { row, col12, loader, tabs, tab, coll, colli } from "./atoms.js";
import { streamsSel } from "./stream.js";
import { createViewGen } from "./createView.js";
import { nextTick } from "./util.js";
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
function buildStreamList(streams) {
    const tabsEl = tabs(streams.map((_, index) => tab({
        label: `Stream ${index + 1}`,
        id: `#stream${index}`,
        active: index === streams.length - 1
    })));
    const streamsEl = streams.map((stream, index) => mnt(atr(col12([])).map([
        ["id", `stream${index}`],
        ["className", "grey darken-4"]
    ]))(coll(Object.entries(stream).map(([key, value]) => {
        return colli({
            icon: "content_paste",
            text: `${key}: ${value}`
        });
    }))));
    const wrap = mnt(el("div", () => {
        if (streams.length) {
            nextTick(() => {
                M.Tabs.init(tabsEl, { swipeable: true });
            });
        }
    }))(row([col12([tabsEl, ...streamsEl])]));
    return wrap;
}
function listViewGen({ state: { getState, updateState, subscribe } }) {
    // const info: HTMLPreElement = el("pre")
    // function setInfo(data: StreamData[]): void {
    //     atr(info).prop("textContent")(JSON.stringify(data, null, 4))
    // }
    // setInfo(getState().streams)
    const view = el("div");
    const viewMnt = mnt(view);
    subscribe((oldState) => {
        onDiff({
            current: getState(),
            previous: oldState,
            selector: streamsSel
        }).do((streams) => {
            emt(view);
            viewMnt(buildStreamList(streams));
        });
    });
    return viewMnt(buildStreamList(getState().streams));
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
