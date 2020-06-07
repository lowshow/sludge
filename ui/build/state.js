export function initState(state) {
    const subscribers = [];
    const deadFn = () => { };
    return {
        getState: () => state,
        updateState: (newState) => {
            const oldState = Object.assign({}, state);
            Object.assign(state, newState);
            subscribers.forEach((sub) => sub(oldState));
        },
        subscribe: (fn) => {
            subscribers.push(fn);
            const index = subscribers.length;
            return () => {
                subscribers[index] = deadFn;
            };
        }
    };
}
export function onDiff({ current, previous, selector }) {
    return {
        do: (fn) => {
            const curr = selector(current);
            if (selector(previous) !== curr)
                fn(curr);
        }
    };
}
