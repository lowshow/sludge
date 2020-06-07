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
function parseData(data) {
    const idMatch = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}";
    const match = {
        streamUI: "url",
        stream: idMatch,
        playlist: idMatch,
        hub: `${idMatch}\/hubs`
    };
    if (typeof data !== "object") {
        throw Error("Invalid data");
    }
    return Object.keys(match).reduce((prev, curr) => {
        if (curr in data) {
            if (match[curr] === "url") {
                try {
                    new URL(data[curr]).toString();
                    prev[curr] = data[curr];
                    return prev;
                }
                catch (_a) {
                    throw Error(`Data invalid ${curr}`);
                }
            }
            else if (data[curr].match(match[curr]) !== null) {
                prev[curr] = data[curr];
                return prev;
            }
            throw Error(`Data invalid ${curr}`);
        }
        throw Error(`Data missing ${curr}`);
    }, match);
}
function getStream({ isLive, options, state: { getState, updateState }, url }) {
    fetch(url, options)
        .then((data) => data.json())
        .then(parseData)
        .then((data) => {
        const streams = [...getState().streams, data];
        updateState({ view: View.list, streams });
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
    const url = isLive ? "/stream" : dummyStreamDataURL();
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
    const url = isLive ? addStream : dummyStreamDataURL();
    getStream({ isLive, options: {}, state, url });
}
export function streamGen({ state }) {
    const { getState, subscribe } = state;
    subscribe((oldState) => {
        onDiff({
            current: getState(),
            previous: oldState,
            selector: cStreamSel
        }).do(() => create({ state }));
        onDiff({
            current: getState(),
            previous: oldState,
            selector: aStreamSel
        }).do(() => add({ state }));
    });
}
