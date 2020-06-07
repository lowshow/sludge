import { getEl } from "./dom.js";
import { main } from "./main.js";
(async () => {
    try {
        const container = await getEl({
            selector: "#appContainer"
        });
        main({ container });
    }
    catch (e) {
        console.error("Application Error", e);
    }
})();
