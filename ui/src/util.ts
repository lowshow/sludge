import { Resolve, Reject, F } from "./interfaces.js"
import { el, mnt, umnt } from "./dom.js"

// TODO: add doc
export function getEl<T extends HTMLElement>({
    selector,
    timeout = 1000
}: {
    selector: string
    timeout?: number
}): Promise<T> {
    return new Promise((resolve: Resolve<T>, reject: Reject): void => {
        const base: number = performance.now()
        requestAnimationFrame((time: number): void => {
            if (time - base >= timeout) return reject()

            const item: T | null = document.querySelector<T>(selector)
            if (item) return resolve(item)
        })
    })
}

// TODO: add doc
export function randInt(from: number, to: number): number {
    if (to < from) return from
    return ~~(Math.random() * (to - from) + from)
}

// TODO: add doc
export function sleep(seconds: number): Promise<void> {
    return new Promise((resolve: Resolve<void>): void => {
        setTimeout((): void => resolve(), seconds * 1000)
    })
}

export function slsh(url: string): string {
    return url.endsWith("/") ? url : `${url}/`
}

export function last<T>(arr: T[]): T {
    return arr[arr.length - 1]
}

export function copyURL(value: string): void {
    const txt: HTMLTextAreaElement = el("textarea")
    txt.value = value
    txt.setAttribute("readonly", "")
    txt.style.position = "absolute"
    txt.style.left = "-9999px"
    mnt(document.body)(txt)
    const sel: Selection | null = document.getSelection()
    const selected: Range | undefined =
        sel !== null && sel.rangeCount > 0 ? sel.getRangeAt(0) : undefined
    txt.select()
    document.execCommand("copy")
    umnt(txt)
    if (sel && selected) {
        sel.removeAllRanges()
        sel.addRange(selected)
    }
}

export function nextTick(fn: F<void, void>): void {
    setTimeout(fn, 0)
}
