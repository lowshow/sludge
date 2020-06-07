import { State, SFn } from "./main.js"
import { onDiff } from "./state.js"
import { emt, el, mnt, atr, MntFn } from "./dom.js"
import { row, col12, loader, tabs, tab, coll, colli } from "./atoms.js"
import { streamsSel, StreamData } from "./stream.js"
import { createViewGen } from "./createView.js"
import { nextTick } from "./util.js"

export enum View {
    create,
    empty,
    list,
    loading
}

export function viewSel(state: State): View {
    return state.view
}

function emptyViewGen(): HTMLDivElement {
    // Add Stream
    // From existing input/button
    // Create new stream
    return row(
        col12(atr(el("p")).map([["textContent", "You have no streams."]]))
    )
}

function loadingViewGen(): HTMLDivElement {
    return row(col12(loader()))
}

function buildStreamList(streams: StreamData[]): HTMLDivElement {
    const tabsEl: HTMLUListElement = tabs(
        streams.map(
            (_: StreamData, index: number): HTMLLIElement =>
                tab({
                    label: `Stream ${index + 1}`,
                    id: `#stream${index}`,
                    active: index === streams.length - 1
                })
        )
    )
    const streamsEl: HTMLDivElement[] = streams.map(
        (stream: StreamData, index: number): HTMLDivElement =>
            mnt(
                atr(col12([])).map([
                    ["id", `stream${index}`],
                    ["className", "grey darken-4"]
                ])
            )(
                coll(
                    Object.entries(stream).map(
                        ([key, value]: [string, string]): HTMLLIElement => {
                            return colli({
                                icon: "content_paste",
                                text: `${key}: ${value}`
                            })
                        }
                    )
                )
            )
    )

    const wrap: HTMLDivElement = mnt(
        el("div", (): void => {
            if (streams.length) {
                nextTick((): void => {
                    M.Tabs.init(tabsEl, { swipeable: true })
                })
            }
        })
    )(row([col12([tabsEl, ...streamsEl])]))

    return wrap
}

function listViewGen({
    state: { getState, updateState, subscribe }
}: {
    state: SFn
}): HTMLDivElement {
    // const info: HTMLPreElement = el("pre")
    // function setInfo(data: StreamData[]): void {
    //     atr(info).prop("textContent")(JSON.stringify(data, null, 4))
    // }
    // setInfo(getState().streams)
    const view: HTMLDivElement = el("div")
    const viewMnt: MntFn<HTMLDivElement> = mnt(view)

    subscribe((oldState: State): void => {
        onDiff({
            current: getState(),
            previous: oldState,
            selector: streamsSel
        }).do((streams: StreamData[]): void => {
            emt(view)
            viewMnt(buildStreamList(streams))
        })
    })
    return viewMnt(buildStreamList(getState().streams))
}

export function views({
    container,
    state
}: {
    state: SFn
    container: HTMLElement
}): void {
    const { getState, subscribe, updateState }: SFn = state
    const set: MntFn<HTMLElement> = mnt(container)
    const createView: HTMLDivElement = createViewGen({
        state
    })
    const emptyView: HTMLDivElement = emptyViewGen()
    const loadingView: HTMLDivElement = loadingViewGen()
    const listView: HTMLDivElement = listViewGen({ state })

    setView(View.empty)
    function setView(view: View): void {
        emt(container)
        switch (view) {
            case View.create:
                set(createView)
                break
            case View.empty:
                set(emptyView)
                break
            case View.list:
                // if list state is empty, go to empty page
                if (getState().streams.length) {
                    set(listView)
                } else {
                    updateState({ view: View.empty })
                }
                break
            case View.loading:
                set(loadingView)
                break
        }
    }

    subscribe((oldState: State): void => {
        onDiff({
            current: getState(),
            previous: oldState,
            selector: viewSel
        }).do(setView)
    })
}
