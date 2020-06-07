import { toast } from "./atoms.js"

export function err({
    debug = false,
    error
}: {
    error: Error
    debug?: boolean
}): void {
    if (debug) console.error(error)
    switch (error.name) {
        case "NetworkError":
            toast("There was a problem making that request.")
            break
        default:
            toast("There was a problem.")
    }
}
