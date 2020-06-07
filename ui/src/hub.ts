// function getEl(selector) {
//     return document.querySelector(selector)
// }

// function el(tag) {
//     return document.createElement(tag)
// }

// function click(el) {
//     return (fn) => el.addEventListener("click", fn)
// }

// const match = {
//     id:
//         "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}",
//     url: "https?://(www.)?[-a-zA-Z0-9@:%._+~#=]{1,256}"
// }

// async function parseData(data) {
//     return data.map((item) => {
//         if (typeof item !== "object") {
//             throw Error("Invalid data")
//         }

//         return Object.keys(match).reduce((prev, curr) => {
//             if (curr in item && item[curr].match(match[curr]) !== null) {
//                 prev[curr] = item[curr]
//                 return prev
//             }
//             throw Error(`Data missing ${curr}`)
//         }, {})
//     })
// }

// const root = getEl("#root")
// const hubs = getEl("#hubs")
// const loader = getEl("#loader")
// const error = getEl("#error")
// const hubUrlAddBtn = getEl("#hubUrlAddBtn")
// const hubUrlInput = getEl("#hubUrlInput")

// // get alias from path
// const streamAlias = window.location.pathname.split("/").filter((p) => !!p)[1]

// load()

// function setLoading() {
//     hubs.innerHTML = ""
//     root.className = "root loading"
// }

// function load() {
//     setLoading()
//     // request hub list
//     fetch(`/${streamAlias}/hubs`)
//         .then((data) => data.json())
//         .then(parseData)
//         .then((data) => {
//             setValues(data)
//             root.classList.remove("loading")
//             root.classList.add("complete")
//         })
//         .catch((err) => {
//             root.classList.remove("loading")
//             root.classList.add("error")
//             error.textContent = err.message
//         })
// }

// // populate table with hub urls/ checkbox/ rm button
// function setValues(data) {
//     const selected = {}

//     const delBtn = el("button")
//     delBtn.className = "btn"
//     delBtn.textContent = "Delete selected hubs"
//     delBtn.addEventListener("click", async () => {
//         setLoading()
//         // snd command to remove
//         const x = Object.entries(selected).reduce((p, [k, v]) => {
//             if (v)
//                 p.push(fetch(`/${streamAlias}`, { method: "DELETE", body: k }))
//             return p
//         }, [])
//         await Promise.all(x)
//         load()
//     })

//     hubs.appendChild(delBtn)

//     data.forEach((item) => {
//         selected[item.id] = false
//         const box = el("div")
//         box.classList.add("item__box")
//         hubs.appendChild(box)
//         const check = el("input")
//         check.type = "checkbox"
//         check.classList.add("item__check")
//         check.id = item.id
//         box.appendChild(check)
//         check.addEventListener("change", () => {
//             selected[item.id] = !selected[item.id]
//         })
//         const title = el("label")
//         title.textContent = item.url
//         title.classList.add("item__label")
//         title.htmlFor = item.id
//         box.appendChild(title)
//     })
// }

// // add new hubs via input and add button
// hubUrlAddBtn.addEventListener("click", () => {
//     const url = hubUrlInput.value
//     setLoading()
//     if (url.match(match.url) === null) {
//         load()
//         return
//     }

//     fetch(`/${streamAlias}`, { method: "PUT", body: url })
//         .then(() => load())
//         .catch((err) => {
//             root.classList.remove("loading")
//             root.classList.add("error")
//             error.textContent = err.message
//         })
// })
