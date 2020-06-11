import { onDiff } from "./state.js";
import { Mode } from "./main.js";
import { dummyStreamDataURL } from "./dummyData.js";
import { View } from "./view.js";
import { err } from "./errors.js";
function cStreamSel(state) {
    return state.createStream;
}
export function aStreamSel(state) {
    return state.addStream;
}
export function streamsSel(state) {
    return state.streams;
}
export function vStreamsSel(state) {
    return state.viewStreamIndex;
}
export function selectedStream(state) {
    return streamsSel(state)[vStreamsSel(state)];
}
function parseData(data) {
    if (typeof data !== "object") {
        throw Error("Invalid data");
    }
    try {
        new URL(data.admin).toString();
        new URL(data.download).toString();
        new URL(data.hub).toString();
    }
    catch (_a) {
        throw Error("Invalid data");
    }
    return data;
}
function getStream({ isLive, options, state: { getState, updateState }, url }) {
    fetch(url, options)
        .then((data) => data.json())
        .then(parseData)
        .then((data) => {
        const streams = [...getState().streams, data];
        updateState({
            view: View.list,
            streams,
            viewStreamIndex: streams.length - 1
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
function create({ state }) {
    const { getState, updateState } = state;
    const { mode, createStream } = getState();
    if (!createStream)
        return;
    // set stream to loading page
    updateState({ view: View.loading, createStream: false });
    const isLive = mode === Mode.live;
    const url = isLive ? "/stream" : dummyStreamDataURL.next().value;
    const options = { method: isLive ? "POST" : "GET" };
    getStream({ url, options, isLive, state });
}
function add({ state }) {
    const { getState, updateState } = state;
    const { mode, addStream } = getState();
    if (!addStream)
        return;
    try {
        new URL(addStream).toString();
    }
    catch (e) {
        err(e);
        return;
    }
    // set stream to loading page
    updateState({ view: View.loading, addStream: "" });
    const isLive = mode === Mode.live;
    const url = isLive ? addStream : dummyStreamDataURL.next().value;
    getStream({ isLive, options: {}, state, url });
}
export function streamGen({ state }) {
    const { getState, subscribe } = state;
    subscribe((oldState) => {
        const current = getState();
        onDiff({
            current,
            previous: oldState,
            selector: cStreamSel
        }).do(() => create({ state }));
        onDiff({
            current,
            previous: oldState,
            selector: aStreamSel
        }).do(() => add({ state }));
    });
}
