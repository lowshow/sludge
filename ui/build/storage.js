import { onDiff } from "./state.js";
import { streamsSel } from "./stream.js";
import { validateState } from "./validate.js";
function setStreamsStore(streams) {
    localStorage.setItem("streams", JSON.stringify(streams));
}
function getStateStore() {
    try {
        const state = localStorage.getItem("state");
        if (!state)
            return undefined;
        return validateState(JSON.parse(state));
    }
    catch (_a) {
        return undefined;
    }
}
function setStateStore(state) {
    localStorage.setItem("state", JSON.stringify(state));
}
export function storage({ state: { getState, subscribe, updateState } }) {
    subscribe((previous) => {
        const current = getState();
        setStateStore(current);
        onDiff({
            current,
            previous,
            selector: streamsSel
        }).do((streams) => {
            setStreamsStore(streams.map((stream) => stream.admin));
        });
    });
    return () => {
        const state = getStateStore();
        if (!state)
            return;
        updateState(Object.assign(Object.assign({}, state), { viewStreamIndex: state.streams.length - 1 }));
    };
}
