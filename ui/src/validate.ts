import { Maybe } from "./interfaces.js"
import { HubData } from "./hub.js"
import { State, Mode } from "./main.js"
import { StreamData } from "./stream.js"
import { View } from "./view.js"

export function validateHubData(data: Maybe<HubData>): HubData {
    new URL((data as HubData).url).toString()
    if (
        (data as HubData).id.match(
            "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"
        ) === null
    ) {
        throw Error()
    }

    return data as HubData
}

export function validateHubDataArray(data: Maybe<HubData[]>): HubData[] {
    if (!Array.isArray(data)) {
        throw Error("Invalid data")
    }

    try {
        return data.map((hub: HubData): HubData => validateHubData(hub))
    } catch {
        throw Error("Invalid data")
    }
}

export function validateStreamDataArray(
    data: Maybe<StreamData[]>
): StreamData[] {
    if (!Array.isArray(data)) {
        throw Error("Invalid data")
    }

    try {
        return data.map(
            (stream: StreamData): StreamData => validateStreamData(stream)
        )
    } catch {
        throw Error("Invalid data")
    }
}

export function validateStreamData(data: Maybe<StreamData>): StreamData {
    if (typeof data !== "object") {
        throw Error("Invalid data")
    }

    try {
        new URL(data.admin).toString()
        new URL(data.download).toString()
        new URL(data.hub).toString()
    } catch {
        throw Error("Invalid data")
    }

    return data
}

function isHubDataArray(hubs: Maybe<HubData[]>): hubs is HubData[] {
    try {
        validateHubDataArray(hubs)
        return true
    } catch {
        return false
    }
}

function isStreamDataArray(
    streams: Maybe<StreamData[]>
): streams is StreamData[] {
    try {
        validateStreamDataArray(streams)
        return true
    } catch {
        return false
    }
}

export function validateState(state: Maybe<State>): State {
    const s: State = state as State

    const fail: boolean[] = [
        typeof s.addHub === "string",
        typeof s.addStream === "string",
        typeof s.clickedCloud === "boolean",
        typeof s.createStream === "boolean",
        Object.entries(s.hubs)
            .map(([k, y]: [string, HubData[]]): boolean => {
                return isHubDataArray(y) && parseInt(k, 10) < s.streams.length
            })
            .filter((item: boolean): boolean => !item).length === 0,
        Object.values(Mode).includes(s.mode),
        typeof s.rmHub === "string",
        typeof new URL(s.streamUI).toString() === "string",
        isStreamDataArray(s.streams),
        Object.values(View).includes(s.view),
        typeof s.viewStreamIndex === "number" &&
            s.viewStreamIndex < s.streams.length
    ].filter((item: boolean): boolean => !item)

    if (fail.length) {
        throw Error("Invalid state data")
    }

    return s
}
