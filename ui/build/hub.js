import { Mode } from "./main.js";
import { onDiff } from "./state.js";
import { err } from "./errors.js";
import { View } from "./view.js";
import { dummyHubDataURL } from "./dummyData.js";
import { vStreamsSel, selectedStream } from "./stream.js";
import { validateHubDataArray } from "./validate.js";
export function vHubsSel(state) {
    return state.hubs[state.viewStreamIndex] || [];
}
export function hubsSel(state) {
    return state.hubs;
}
export function aHubSel(state) {
    return state.addHub;
}
export function rmHubSel(state) {
    return state.rmHub;
}
function getHubs({ state }) {
    const { getState, updateState } = state;
    const s = getState();
    const { mode } = s;
    const selected = selectedStream(s);
    const isLive = mode === Mode.live;
    const url = isLive ? selected.hub : dummyHubDataURL.next().value;
    fetch(url)
        .then((data) => data.json())
        .then(validateHubDataArray)
        .then((data) => {
        const { viewStreamIndex, hubs } = getState();
        updateState({
            hubs: Object.assign(Object.assign({}, hubs), { [viewStreamIndex]: data })
        });
    })
        .catch((error) => {
        updateState({ view: View.list });
        if (error.name === "TypeError") {
            error.name = "NetworkError";
        }
        err({ error, debug: !isLive });
    });
}
function add({ state }) {
    const { getState, updateState } = state;
    const s = getState();
    const { mode, addHub } = s;
    if (!addHub)
        return;
    try {
        new URL(addHub).toString();
    }
    catch (e) {
        err(e);
        return;
    }
    const selected = selectedStream(s);
    updateState({ addHub: "" });
    const isLive = mode === Mode.live;
    const url = isLive ? selected.admin : dummyHubDataURL.next().value;
    const options = isLive
        ? { method: "PUT", body: addHub }
        : { method: "GET" };
    fetch(url, options)
        .then(() => {
        getHubs({ state });
    })
        .catch((error) => {
        if (error.name === "TypeError") {
            error.name = "NetworkError";
        }
        err({ error, debug: !isLive });
    });
}
function rm({ state }) {
    const { getState, updateState } = state;
    const s = getState();
    const { mode, rmHub } = s;
    if (!rmHub)
        return;
    const selected = selectedStream(s);
    updateState({ rmHub: "" });
    const isLive = mode === Mode.live;
    const url = isLive ? selected.admin : dummyHubDataURL.next().value;
    const options = isLive
        ? { method: "DELETE", body: rmHub }
        : { method: "GET" };
    fetch(url, options)
        .then(() => {
        getHubs({ state });
    })
        .catch((error) => {
        if (error.name === "TypeError") {
            error.name = "NetworkError";
        }
        err({ error, debug: !isLive });
    });
}
export function hubGen({ state }) {
    const { getState, subscribe } = state;
    // add hub -> from user provided hub url
    // get hubs -> stream-hub url
    // delete hub -> id returned from hub url req
    subscribe((oldState) => {
        const current = getState();
        onDiff({
            current,
            previous: oldState,
            selector: aHubSel
        }).do(() => add({ state }));
        onDiff({
            current,
            previous: oldState,
            selector: rmHubSel
        }).do(() => rm({ state }));
        onDiff({
            current,
            previous: oldState,
            selector: vStreamsSel
        }).do((index) => {
            var _a;
            if (!((_a = current.hubs[index]) === null || _a === void 0 ? void 0 : _a.length)) {
                getHubs({ state });
            }
        });
    });
}
