import { Resolve, Reject, ValueOf, F } from "./interfaces.js"

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

            const l: T | null = document.querySelector<T>(selector)
            if (l) return resolve(l)
        })
    })
}

// TODO: add doc
export function el<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    onMount?: F<void, void>
): HTMLElementTagNameMap[K] {
    const element: HTMLElementTagNameMap[K] = document.createElement(tagName)
    Object.assign(element, { onMount })
    return element
}

type SetAttr<T> = (property: keyof T) => SetAttrAs<T>
type SetAttrAs<T> = (value: ValueOf<T>) => T
type SetAttrMap<T> = (attributeMap: [keyof T, ValueOf<T>][]) => T
type AtrReturn<T> = { prop: SetAttr<T>; map: SetAttrMap<T> }
export function atr<T extends HTMLElement>(element: T): AtrReturn<T> {
    return {
        map: (attributeMap: [keyof T, ValueOf<T>][]): T => {
            attributeMap.forEach(([p, v]: [keyof T, ValueOf<T>]): void => {
                element[p] = v
            })
            return element
        },
        prop: (property: keyof T): SetAttrAs<T> => (value: ValueOf<T>): T => {
            element[property] = value
            return element
        }
    }
}

export type MntFn<T extends HTMLElement> = (
    children: HTMLElement | HTMLElement[],
    options?: { prepend?: boolean }
) => T

interface Mountable extends HTMLElement {
    onMount: F<void, void>
}

function isMountable(element: HTMLElement): element is Mountable {
    return typeof (element as Mountable).onMount === "function"
}

// TODO: add doc
export function mnt<T extends HTMLElement>(parent: T): MntFn<T> {
    return (
        children: HTMLElement | HTMLElement[],
        options: { prepend?: boolean } = {
            prepend: false
        }
    ): T => {
        const c: HTMLElement[] = Array.isArray(children) ? children : [children]
        c.forEach((child: HTMLElement): void => {
            if (options.prepend) {
                parent.prepend(child)
            } else {
                parent.append(child)
            }
            if (isMountable(child)) {
                child.onMount()
            }
        })
        return parent
    }
}

// TODO: add doc
type ListenFn = <K extends keyof HTMLElementEventMap>(
    ev: HTMLElementEventMap[K]
) => void

// TODO: add doc
interface ListenAction {
    do: (fn: ListenFn) => void
}

// TODO: add doc
interface Listen {
    on: <K extends keyof HTMLElementEventMap>(type: K) => ListenAction
}

// TODO: add doc
export function lstn<T extends HTMLElement>(element: T): Listen {
    const fns: ListenFn[] = []
    return {
        on: <K extends keyof HTMLElementEventMap>(type: K): ListenAction => {
            element.addEventListener(
                type,
                (e: HTMLElementEventMap[K]): void => {
                    fns.forEach((f: ListenFn): void => {
                        f(e)
                    })
                }
            )
            return {
                do: (fn: ListenFn): void => {
                    fns.push(fn)
                }
            }
        }
    }
}

// TODO: add doc
export function umnt(element: HTMLElement): void {
    element.remove()
}

// TODO: add doc
export function emt(element: HTMLElement): void {
    element.innerHTML = ""
}

// TODO: add doc
export function cls<T extends HTMLElement>(
    element: T
): (className: string) => T {
    return (className: string): T => {
        element.classList.toggle(className)
        return element
    }
}
