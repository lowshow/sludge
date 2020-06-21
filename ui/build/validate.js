import { Mode } from "./main.js";
import { View } from "./view.js";
export function validateHubData(data) {
    new URL(data.url).toString();
    if (data.id.match("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}") === null) {
        throw Error();
    }
    return data;
}
export function validateHubDataArray(data) {
    if (!Array.isArray(data)) {
        throw Error("Invalid data");
    }
    try {
        return data.map((hub) => validateHubData(hub));
    }
    catch (_a) {
        throw Error("Invalid data");
    }
}
export function validateStreamDataArray(data) {
    if (!Array.isArray(data)) {
        throw Error("Invalid data");
    }
    try {
        return data.map((stream) => validateStreamData(stream));
    }
    catch (_a) {
        throw Error("Invalid data");
    }
}
export function validateStreamData(data) {
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
function isHubDataArray(hubs) {
    try {
        validateHubDataArray(hubs);
        return true;
    }
    catch (_a) {
        return false;
    }
}
function isStreamDataArray(streams) {
    try {
        validateStreamDataArray(streams);
        return true;
    }
    catch (_a) {
        return false;
    }
}
export function validateState(state) {
    const s = state;
    const fail = [
        typeof s.addHub === "string",
        typeof s.addStream === "string",
        typeof s.clickedCloud === "boolean",
        typeof s.createStream === "boolean",
        Object.entries(s.hubs)
            .map(([k, y]) => {
            return isHubDataArray(y) && parseInt(k, 10) < s.streams.length;
        })
            .filter((item) => !item).length === 0,
        Object.values(Mode).includes(s.mode),
        typeof s.rmHub === "string",
        typeof new URL(s.streamUI).toString() === "string",
        isStreamDataArray(s.streams),
        Object.values(View).includes(s.view),
        typeof s.viewStreamIndex === "number" &&
            s.viewStreamIndex < s.streams.length
    ].filter((item) => !item);
    if (fail.length) {
        throw Error("Invalid state data");
    }
    return s;
}
