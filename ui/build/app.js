import { getEl } from "./dom.js";
import { main, Mode } from "./main.js";
// @ts-ignore
import { env } from "/env.js";
;
(async () => {
    try {
        const { mode, streamUI } = env();
        if (!Object.values(Mode).includes(mode) ||
            !new URL(streamUI).toString()) {
            throw Error("Environment variables not set");
        }
        console.table({ mode, streamUI });
        const container = await getEl({
            selector: "#appContainer"
        });
        main({ container, mode, streamUI });
    }
    catch (e) {
        console.error("Application Error", e);
    }
})();
