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
}: AddHubFnArgs): Promise<Hub> {
    // get stream id
    const stream = await dbActions.getStream({ alias: streamAlias })
    // ensure unique
    const hubs: Hub[] = await dbActions.getHubs({ streamId: stream.id })
    if (hubs.find((hub: Hub): boolean => hub.url === hubUrl) !== undefined) {
        throw Error(`Hub ${hubUrl} already used by stream.`)
    }
    // send ping to hub to add playlist URL
    const id: string = await fetch(hubUrl, {
        method: "POST",
        body: publicUrl
    }).then((res: Response) => res.text())
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
    // ensure exists
    const hubs: Hub[] = await dbActions.getHubs({ streamId: stream.id })
    const hub: Hub | undefined = hubs.find((hub: Hub): boolean => hub.id === id)
    if (hub === undefined) {
        throw Error(`Hub ${id} does not exist.`)
    }
    // send ping to hub to rem playlist URL
    await fetch(hub.url, { method: "DELETE", body: hub.id })
    // rem hub from hub list
    await dbActions.removeHub({ id, streamId: stream.id })
}

// TODO: add docs
export async function getHubs({
    dbActions,
    streamAlias
}: HubFnArgs): Promise<Hub[]> {
    // get stream id
    const stream = await dbActions.getStream({ alias: streamAlias })
    // return hub list
    return await dbActions.getHubs({ streamId: stream.id })
}
