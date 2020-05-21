import * as path from "https://deno.land/std/path/mod.ts"
import { DBActions } from "./db.ts"
import { v4 } from "https://deno.land/std/uuid/mod.ts"
import { Response } from "https://deno.land/std/http/server.ts"

// TODO: add docs
export async function createStream(
    dbActions: DBActions,
    rootDir: string,
    publicUrl: string
): Promise<Response> {
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
    // return public path for upload/ UI/ public stream
    return {
        body: new TextEncoder().encode(
            JSON.stringify({
                ui: new URL(`stream/${alias}`, publicUrl).toString(),
                upload: new URL(alias, publicUrl).toString(),
                playlist: new URL(`${alias}`, publicUrl).toString()
            })
        ),
        status: 200,
        headers
    }
}
