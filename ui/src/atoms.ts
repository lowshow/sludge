import { el, mnt, atr } from "./dom.js"

export function addBtn(): HTMLButtonElement {
    return mnt(
        atr(el("button")).map([
            ["className", btnClass("scale-transition btn-floating btn-large")]
        ])
    )(
        atr(el("i")).map([
            ["className", "material-icons black-text"],
            ["textContent", "add"]
        ])
    )
}

export function row(children: HTMLElement | HTMLElement[]): HTMLDivElement {
    return mnt(atr(el("div")).prop("className")("row"))(children)
}

export function col12(children: HTMLElement | HTMLElement[]): HTMLDivElement {
    return mnt(atr(el("div")).prop("className")("col s12"))(children)
}

export function btnClass(classes: string): string {
    return `${classes} waves-effect waves-teal light-green accent-4 black-text`
}

export function loader(): HTMLDivElement {
    return mnt(atr(el("div")).prop("className")("progress blue"))(
        atr(el("div")).prop("className")("indeterminate blue darken-4")
    )
}

export function toast(message: string): void {
    M.toast({ html: message, classes: "blue lighten-1" })
}

export function tabs(children: HTMLElement | HTMLElement[]): HTMLUListElement {
    return mnt(
        atr(el("ul")).prop("className")("tabs blue-grey tabs-fixed-width")
    )(children)
}

export function tab({
    id,
    label,
    active = false
}: {
    label: string
    id: string
    active?: boolean
}): HTMLLIElement {
    return mnt(
        atr(el("li")).prop("className")(`tab col ${active ? "active" : ""}`)
    )(
        atr(el("a")).map([
            ["className", "black-text"],
            ["href", id],
            ["textContent", label]
        ])
    )
}

export function coll(children: HTMLElement | HTMLElement[]): HTMLUListElement {
    return mnt(atr(el("ul")).prop("className")("collection"))(children)
}

export function colli({
    icon,
    text
}: {
    text: string
    icon: string
}): HTMLLIElement {
    return mnt(
        atr(el("li")).prop("className")("collection-item grey darken-3")
    )(
        mnt(atr(el("div")).map([["textContent", text]]))([
            mnt(
                atr(el("button")).map([
                    ["className", "btn-small secondary-content"]
                ])
            )(
                atr(el("i")).map([
                    ["className", "material-icons black-text"],
                    ["textContent", icon]
                ])
            )
        ])
    )
}
