import { State, SFn } from "./main.js"
import { onDiff } from "./state.js"
import { emt, el, mnt, atr, MntFn } from "./dom.js"
import { row, col12, loader } from "./atoms.js"
import { createViewGen } from "./createView.js"
import { listViewGen } from "./listView.js"
import { streamsSel, StreamData } from "./stream.js"

export enum View {
    create,
    empty,
    list,
    loading
}

export function viewSel(state: State): View {
    return state.view
}

function emptyViewGen({
    state: { subscribe, getState, updateState }
}: {
    state: SFn
}): HTMLDivElement {
    subscribe((previous: State): void => {
        onDiff({
            current: getState(),
            previous,
            selector: streamsSel
        }).do((streams: StreamData[]): void => {
            if (streams.length) {
                updateState({ view: View.list })
            }
        })
    })
    return row(
        col12(atr(el("p")).map([["textContent", "You have no streams."]]))
    )
}

function loadingViewGen(): HTMLDivElement {
    return row(col12(loader()))
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
    const emptyView: HTMLDivElement = emptyViewGen({ state })
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
