import { F } from "./interfaces"

export type UpdateStateFn<T> = (args: Partial<T>) => void

export type GetStateFn<T> = () => T

type UnsubscribeStateFn = F<void, void>

type SubscribeStateFn<T> = (fn: F<T, void>) => UnsubscribeStateFn

export interface StateFns<T> {
    getState: GetStateFn<T>
    updateState: UpdateStateFn<T>
    subscribe: SubscribeStateFn<T>
}

export function initState<T>(state: T): StateFns<T> {
    const subscribers: F<T, void>[] = []
    const deadFn = (): void => {}
    return {
        getState: (): T => state,
        updateState: (newState: Partial<T>): void => {
            const oldState: T = JSON.parse(JSON.stringify(state))
            Object.assign(state, newState)
            subscribers.forEach((sub: F<T, void>): void => sub(oldState))
        },
        subscribe: (fn: F<T, void>): UnsubscribeStateFn => {
            subscribers.push(fn)
            const index: number = subscribers.length
            return (): void => {
                subscribers[index] = deadFn
            }
        }
    }
}

export function onDiff<T, U>({
    current,
    previous,
    selector
}: {
    previous: T
    current: T
    selector: (state: T) => U
}): { do: F<F<U, void>, void> } {
    return {
        do: (fn: F<U, void>): void => {
            const curr: U = selector(current)
            if (JSON.stringify(selector(previous)) !== JSON.stringify(curr))
                fn(curr)
        }
    }
}
