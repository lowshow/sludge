import { getEl } from "./dom.js"
import { main, Mode } from "./main.js"
// @ts-ignore
import { env } from "/env.js"

interface Env {
    mode: Mode
    streamUI: string
}

;(async (): Promise<void> => {
    try {
        const { mode, streamUI }: Env = env()
        if (
            !Object.values(Mode).includes(mode) ||
            !new URL(streamUI).toString()
        ) {
            throw Error("Environment variables not set")
        }

        console.table({ mode, streamUI })

        const container: HTMLDivElement = await getEl({
            selector: "#appContainer"
        })

        main({ container, mode, streamUI })
    } catch (e) {
        console.error("Application Error", e)
    }
})()
