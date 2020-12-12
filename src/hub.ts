import { DBActions } from "./db.ts"
import { Hub } from "./common/interfaces.ts"

// TODO: add docs
interface HubFnArgs {
    streamAlias: string
    dbActions: DBActions
}

// TODO: add docs
interface AddHubFnArgs extends HubFnArgs {
    hubUrl: string
    publicUrl: string
}

// TODO: add docs
interface DeleteHubFnArgs extends HubFnArgs {
    id: string
}

// TODO: add docs
export async function addHub({
    dbActions,
    streamAlias,
    hubUrl,
    publicUrl
}: AddHubFnArgs): Promise<Hub | undefined> {
    // get stream id
    const stream = await dbActions.getStream({ alias: streamAlias })
    if (!stream) {
        throw Error(`Stream not found`)
    }
    // ensure unique
    const hubs = await dbActions.getHubs({ streamId: stream.id })
    if (!hubs) {
        throw Error(`Hubs not found`)
    }
    if (hubs.find((hub: Hub): boolean => hub.url === hubUrl) !== undefined) {
        throw Error(`Hub ${hubUrl} already used by stream.`)
    }
    // send ping to hub to add playlist URL
    // TODO: handle if failed to add
    const id: string = await fetch(hubUrl, {
        headers: {
            "Content-Type": "text/plain"
        },
        method: "PUT",
        body: new URL(stream.id, publicUrl).toString()
    }).then((res: Response) => res.text())

    if (!id) {
        throw Error("Could not add hub.")
    }
    // add hub to hub list
    return await dbActions.addHub({ id, streamId: stream.id, url: hubUrl })
}

// TODO: add docs
export async function removeHub({
    dbActions,
    streamAlias,
    id
}: DeleteHubFnArgs) {
    // get stream id
    const stream = await dbActions.getStream({ alias: streamAlias })
    if (!stream) {
        throw Error(`Stream not found`)
    }
    // ensure exists
    const hubs = await dbActions.getHubs({ streamId: stream.id })
    if (!hubs) {
        throw Error(`Hubs not found`)
    }
    const hub: Hub | undefined = hubs.find((hub: Hub): boolean => hub.id === id)
    if (hub === undefined) {
        throw Error(`Hub ${id} does not exist.`)
    }
    // send ping to hub to rem playlist URL
    // TODO: handle if failed to remove
    await fetch(hub.url, {
        headers: {
            "Content-Type": "text/plain"
        },
        method: "DELETE",
        body: new TextEncoder().encode(hub.id)
    })
    // rem hub from hub list
    await dbActions.removeHub({ id, streamId: stream.id })
}

// TODO: add docs
export async function getHubs({
    dbActions,
    streamAlias
}: HubFnArgs): Promise<Hub[] | undefined> {
    // get stream id
    const stream = await dbActions.getStream({ alias: streamAlias })
    if (!stream) {
        throw Error(`Stream not found`)
    }
    // return hub list
    return await dbActions.getHubs({ streamId: stream.id })
}
