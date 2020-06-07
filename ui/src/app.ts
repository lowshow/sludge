import { getEl } from "./dom.js"
import { main } from "./main.js"
;(async (): Promise<void> => {
    try {
        const container: HTMLDivElement = await getEl({
            selector: "#appContainer"
        })
        main({ container })
    } catch (e) {
        console.error("Application Error", e)
    }
})()
