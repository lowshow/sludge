import * as path from "https://deno.land/std/path/mod.ts"
import { DBActions } from "./db.ts"
import { v4 } from "https://deno.land/std/uuid/mod.ts"
import { Response } from "https://deno.land/std/http/server.ts"

interface CreateStreamFnArgs {
    dbActions: DBActions
    rootDir: string
    publicUrl: string
}

interface StreamData {
    admin: string
    download: string
    hub: string
}

// TODO: add docs
export async function getStream({
    alias,
    dbActions,
    publicUrl
}: {
    alias: string
    dbActions: DBActions
    publicUrl: string
}): Promise<StreamData> {
    const { id } = await dbActions.getStream({ alias })
    // return public path for upload/ UI/ public stream
    const streamData: StreamData = {
        admin: new URL(`${alias}/admin`, publicUrl).toString(),
        download: new URL(id, publicUrl).toString(),
        hub: new URL(`${alias}/hubs`, publicUrl).toString()
    }

    return streamData
}

// TODO: add docs
export async function createStream({
    dbActions,
    publicUrl,
    rootDir
}: CreateStreamFnArgs): Promise<Response> {
    const id: string = v4.generate()
    const alias: string = v4.generate()
    // create dir
    const dirPath: string = path.join(rootDir, "audio", id)
    await Deno.mkdir(dirPath, { recursive: true })
    // add alias/id to file/store
    await dbActions.createStream({
        id,
        alias
    })
    const headers = new Headers()
    headers.set("content-type", "application/json")

    return {
        body: new TextEncoder().encode(
            JSON.stringify(await getStream({ alias, publicUrl, dbActions }))
        ),
        status: 200,
        headers
    }
}
