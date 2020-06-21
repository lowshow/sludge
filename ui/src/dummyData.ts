import { StreamData } from "./stream.js"
import { HubData } from "./hub.js"

function* _dummyStreamDataURL(): Generator<string, any, undefined> {
    for (let i: number = 0; i < 100; i++) {
        const id: string = "81b288a6-0ff0-4f2e-ac50-abbc42b1dde"
        const data: StreamData = {
            hub: `https://some.url/${id}${i}/hubs`,
            admin: `https://some.url/${id}${i}/admin`,
            download: `https://some.url/${id}${i}/download`
        }
        yield URL.createObjectURL(
            new Blob([JSON.stringify(data)], {
                type: "application/json"
            })
        )
    }
}

export const dummyStreamDataURL: Generator<
    string,
    any,
    undefined
> = _dummyStreamDataURL()

function* _dummyHubDataURL(): Generator<string, any, undefined> {
    for (let i: number = 0; i < 100; i++) {
        const data: HubData[] = []
        for (let j: number = 0; j < i; j++) {
            const id: string = `81b288a6-0ff0-4f2e-ac50-abbc42b1dde${i + j}`
            data.push({
                id,
                url: `https://some.url/${id}`
            })
        }
        yield URL.createObjectURL(
            new Blob([JSON.stringify(data)], {
                type: "application/json"
            })
        )
    }
}

export const dummyHubDataURL: Generator<
    string,
    any,
    undefined
> = _dummyHubDataURL()
