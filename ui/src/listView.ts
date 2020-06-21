import { StreamData, streamsSel, vStreamsSel } from "./stream.js"
import { tabs, tab, collW, coll, row, col12, btnClass, toast } from "./atoms.js"
import { copyURL, nextTick } from "./util.js"
import { mnt, el, atr, MntFn, emt, lstn, cls } from "./dom.js"
import { SFn, State } from "./main.js"
import { onDiff } from "./state.js"
import { HubData, vHubsSel } from "./hub.js"

function tabInner({
    child,
    id
}: {
    child: HTMLElement
    id: string
}): HTMLDivElement {
    return mnt(el("div", { attr: { className: "tab_inner black", id } }))(child)
}

function hubList({
    state: { updateState, getState, subscribe }
}: {
    state: SFn
}): HTMLDivElement {
    const input: HTMLInputElement = atr(el("input")).map([
        ["type", "url"],
        ["className", "white-text validate"],
        ["id", "addHubInput"]
    ])

    const add: HTMLFormElement = mnt(cls(el("form"))("form"))([
        mnt(atr(el("div")).prop("className")("input-field"))([
            input,
            atr(el("label")).map([
                ["htmlFor", "addHubInput"],
                ["textContent", "Add hub URL"]
            ])
        ]),
        atr(el("button")).map([
            ["type", "submit"],
            ["textContent", "Submit"],
            ["className", btnClass("btn")]
        ])
    ])

    lstn(input)
        .on("invalid")
        .do((): void => {
            if (!input.validity.valid) {
                toast(input.validationMessage)
                return
            }
        })

    lstn(add)
        .on("submit")
        .do((event: Event): void => {
            event.preventDefault()
            updateState({ addHub: input.value })
        })

    const collapse: (viewHubs: HubData[]) => HTMLDivElement = (
        viewHubs: HubData[]
    ): HTMLDivElement => {
        if (!viewHubs.length) return el("div")

        const inner: HTMLUListElement = collW(
            viewHubs.map(
                (hub: HubData, index: number): HTMLLIElement => {
                    const item: HTMLLIElement = coll({
                        label: `Hub ${index + 1}`,
                        btnLabel: "Delete",
                        onButtonClick: (): void => {
                            updateState({ rmHub: hub.id })
                        },
                        text: hub.url
                    })
                    return item
                }
            )
        )

        return mnt(
            el("div", {
                onMount: (): void => {
                    nextTick((): void => {
                        M.Collapsible.init(inner)
                    })
                }
            })
        )(inner)
    }

    const listWrap: HTMLDivElement = col12(collapse(vHubsSel(getState())))
    const listMnt: MntFn<HTMLDivElement> = mnt(listWrap)

    subscribe((oldState: State): void => {
        onDiff({
            current: getState(),
            previous: oldState,
            selector: vHubsSel
        }).do((h: HubData[]): void => {
            emt(listWrap)
            listMnt(collapse(h))
        })
    })

    return mnt(el("div"))([col12(add), listWrap])
}

function buildStreamList({
    current,
    state
}: {
    current: StreamData
    state: SFn
}): HTMLDivElement {
    const tabsEl: HTMLUListElement = tabs([
        tab({
            label: `Info`,
            id: `#streamInfo`,
            active: true
        }),
        tab({
            label: `Hubs`,
            id: `#hubs`,
            active: false
        })
    ])

    const collapse: HTMLUListElement = collW([
        coll({
            label: "Admin",
            btnLabel: "Copy",
            onButtonClick: (): void => {
                copyURL(current.admin)
            },
            text: `<input class="url" type="text" value="${current.admin}" />GET: Retrieve these URLs.<br />POST: Upload audio stream segment.`
        }),
        coll({
            label: "Download",
            btnLabel: "Copy",
            onButtonClick: (): void => {
                copyURL(current.download)
            },
            text: `<input class="url" type="text" value="${current.download}" />GET: Retrieve stream segment playlist.`
        }),
        coll({
            label: "Hubs",
            btnLabel: "Copy",
            onButtonClick: (): void => {
                copyURL(current.hub)
            },
            text: `<input class="url" type="text" value="${current.hub}" />GET: Retrieve stream hubs.<br />PUT: Add hub to stream.<br />DELETE: Remove hub from stream.`
        })
    ])

    const wrap: HTMLDivElement = mnt(
        el("div", {
            onMount: (): void => {
                nextTick((): void => {
                    M.Tabs.init(tabsEl, { swipeable: true })
                    M.Collapsible.init(collapse)
                })
            }
        })
    )(
        row([
            col12([
                tabsEl,
                tabInner({ child: col12(collapse), id: "streamInfo" }),
                tabInner({ child: hubList({ state }), id: "hubs" })
            ])
        ])
    )

    return wrap
}

export function streamsDD({
    state: { getState, updateState, subscribe }
}: {
    state: SFn
}): HTMLDivElement {
    const view: HTMLDivElement = row(col12(el("div")))
    const viewMnt: MntFn<HTMLDivElement> = mnt(view)

    function inner(streams: StreamData[]): HTMLElement[] {
        if (!streams) return []
        const sel: HTMLSelectElement = mnt(
            atr(el("select")).map([
                ["className", "dropdown_select black white-text"]
            ])
        )(
            streams.map(
                (_: StreamData, i: number): HTMLOptionElement =>
                    atr(el("option")).map([
                        ["textContent", `Stream ${i + 1}`],
                        ["value", i],
                        ["selected", i === streams.length - 1 ? "selected" : ""]
                    ])
            )
        )
        lstn(sel)
            .on("click")
            .do((): void => {
                updateState({ viewStreamIndex: parseInt(sel.value, 10) })
            })
        return [sel]
    }

    subscribe((oldState: State): void => {
        const current: State = getState()
        onDiff({
            current,
            previous: oldState,
            selector: streamsSel
        }).do((streams: StreamData[]): void => {
            emt(view)
            viewMnt(inner(streams))
        })
    })

    return viewMnt(inner(streamsSel(getState())))
}

export function listViewGen({ state }: { state: SFn }): HTMLDivElement {
    const { getState, subscribe }: SFn = state
    const dd: HTMLDivElement = streamsDD({ state })
    const viewInner: HTMLDivElement = el("div")
    const view: HTMLDivElement = mnt(el("div"))([dd, viewInner])
    const viewMnt: MntFn<HTMLDivElement> = mnt(viewInner)

    subscribe((oldState: State): void => {
        const current: State = getState()

        onDiff({
            current,
            previous: oldState,
            selector: streamsSel
        }).do((s: StreamData[]): void => {
            emt(viewInner)
            viewMnt(
                buildStreamList({ current: s[vStreamsSel(current)], state })
            )
        })

        onDiff({
            current,
            previous: oldState,
            selector: vStreamsSel
        }).do((index: number): void => {
            emt(viewInner)
            viewMnt(
                buildStreamList({ current: streamsSel(current)[index], state })
            )
        })
    })
    return view
}
