/**
 * On stream click, send request for creating new stream
 * From provided values returned, generate text and links for:
 * - api endpoints
 *  - upload
 *  - hubs
 *  - stream playlist (for specified player, ie syllid)
 * - UI
 *  - splutter
 *  - hubs
 */

// streamUI: new URL(`stream/${alias}`, publicUrl).toString(),
// stream: new URL(alias, publicUrl).toString(),
// playlist: new URL(id, publicUrl).toString(),
// hub: new URL(`${alias}/hubs`, publicUrl).toString(),
// hubUI: new URL(`hubs/${alias}`, publicUrl).toString()

;(() => {
    function el(selector) {
        return document.querySelector(selector)
    }

    function click(el) {
        return (fn) => el.addEventListener("click", fn)
    }

    const root = el("#root")
    const createBtn = el("#createBtn")
    const loader = el("#loader")
    const error = el("#error")

    const streamUrl = el("#streamUrl")
    const hubUrl = el("#hubUrl")
    const playlistUrl = el("#playlistUrl")

    const streamBtn = el("#streamBtn")
    const hubBtn = el("#hubBtn")
    const playlistBtn = el("#playlistBtn")

    const streamUIBtn = el("#streamUIBtn")
    const hubUIBtn = el("#hubUIBtn")

    root.classList.add("init")

    function setValues(data) {
        streamUIBtn.href = data.streamUI
        hubUIBtn.href = data.hubUI
        streamUrl.textContent = data.stream
        click(streamBtn)(copyURL(data.stream, streamBtn))
        hubUrl.textContent = data.hub
        click(hubBtn)(copyURL(data.hub, hubBtn))
        playlistUrl.textContent = data.playlist
        click(playlistBtn)(copyURL(data.playlist, playlistBtn))
    }

    async function parseData(data) {
        const idMatch =
            "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"

        const match = {
            streamUI: `\/stream\/${idMatch}`,
            stream: idMatch,
            playlist: idMatch,
            hub: `${idMatch}\/hubs`,
            hubUI: `\/hubs\/${idMatch}`
        }

        if (typeof data !== "object") {
            throw Error("Invalid data")
        }

        return Object.keys(match).reduce((prev, curr) => {
            if (curr in data && data[curr].match(match[curr]) !== null) {
                prev[curr] = data[curr]
                return prev
            }
            throw Error(`Data missing ${curr}`)
        }, {})
    }

    click(createBtn)(() => {
        root.classList.remove("init")
        root.classList.add("loading")

        fetch("/stream", { method: "POST" })
            .then((data) => data.json())
            .then(parseData)
            .then((data) => {
                setValues(data)
                root.classList.remove("loading")
                root.classList.add("complete")
            })
            .catch((err) => {
                root.classList.remove("loading")
                root.classList.add("error")
                error.textContent = err.message
            })
    })

    function copyURL(value, btn) {
        return () => {
            const el = document.createElement("textarea")
            el.value = value
            el.setAttribute("readonly", "")
            el.style.position = "absolute"
            el.style.left = "-9999px"
            document.body.appendChild(el)
            const sel = document.getSelection()
            const selected =
                sel !== null && sel.rangeCount > 0 ? sel.getRangeAt(0) : false
            el.select()
            document.execCommand("copy")
            document.body.removeChild(el)
            if (sel && selected) {
                sel.removeAllRanges()
                sel.addRange(selected)
            }

            btn.textContent = "Copied!"
        }
    }
})()
