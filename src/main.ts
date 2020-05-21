import {
    serve,
    ServerRequest,
    Response
} from "https://deno.land/std/http/server.ts"
import { v4 } from "https://deno.land/std/uuid/mod.ts"
import { Segment } from "./common/interfaces.ts"
import * as sqlite from "https://deno.land/x/sqlite/mod.ts"
import { initDb, DBActions, getDBActions } from "./db.ts"
import { handleForm } from "./upload.ts"
import { createStream } from "./stream.ts"

// TODO: add doc
async function handleGet(
    req: ServerRequest,
    dbActions: DBActions
): Promise<Response> {
    const path: string[] = req.url.split("/")
    try {
        if (!v4.validate(path[1])) {
            throw Error("Invalid path")
        }

        // return playlist
        // TODO: return as stream?
        const idList: Segment[] = await dbActions.getSegments({
            streamId: path[1],
            segmentId: v4.validate(path[2]) ? path[2] : undefined
        })
        const headers = new Headers()
        headers.set("content-type", "application/json")

        return {
            body: new TextEncoder().encode(JSON.stringify(idList)),
            status: 200,
            headers
        }
    } catch (e) {
        return {
            body: new TextEncoder().encode(e.message),
            status: 404
        }
    }
}

// TODO: add doc
async function handlePost(
    req: ServerRequest,
    dbActions: DBActions,
    rootDir: string,
    publicUrl: string,
    fileUrl: string
): Promise<Response> {
    const path: string[] = req.url.split("/")
    try {
        if (!v4.validate(path[1])) {
            throw Error("Invalid path")
        }

        if (path[1] === "") {
            // create stream id
            return await createStream(dbActions, rootDir, publicUrl)
        }

        // if 1 is a uuid
        // post adds file
        // need to match uuid in KV
        return await handleForm(req, dbActions, rootDir, fileUrl, path[1])
    } catch (e) {
        return {
            body: new TextEncoder().encode(e.message),
            status: 404
        }
    }
}

// TODO: add doc
/**
 * path to get stream create UI
 * path to create stream id
 * path to upload audio segments
 * path to get id playlist
 *
 * add/remove hubs
 */
// nginx static routes
// if /stream
// get 2 = uuid, return splutter for streaming ui
// need to match uuid in KV
// if /
// get ui to create stream
// if /audio/streamId/segmentId
// let nginx return audio files from dir
async function handleReq(
    req: ServerRequest,
    dbActions: DBActions,
    rootDir: string,
    publicUrl: string,
    fileUrl: string
): Promise<Response> {
    switch (req.method) {
        case "GET":
            return await handleGet(req, dbActions)
        case "POST":
            return await handlePost(req, dbActions, rootDir, publicUrl, fileUrl)
        case "OPTIONS":
            return { status: 200 }
        default:
            return {
                body: new TextEncoder().encode("This is not a valid request."),
                status: 400
            }
    }
}

// TODO: add doc
// TODO: move to nginx?
// required for streaming requests
function setCORS(res: Response): Response {
    if (!res.headers) {
        res.headers = new Headers()
    }
    res.headers.append("access-control-allow-origin", "*")
    res.headers.append("access-control-allow-method", "GET")
    res.headers.append(
        "access-control-allow-headers",
        "Origin, X-Requested-With, Content-Type, Accept, Range"
    )
    return res
}

// TODO: add doc
/**
 *
 * @param publicUrl where app is accessed from
 * @param port run on local port
 * @param rootDir app data dir
 * @param dbPath path to db file
 * @param filesUrl public base url for audio files
 */
export async function main(
    publicUrl: string,
    port: string,
    rootDir: string,
    dbPath: string,
    fileUrl: string
): Promise<void> {
    const db: sqlite.DB = await sqlite.open(dbPath)
    const dbActions: DBActions = getDBActions(initDb(db))

    for await (const req of serve(`0.0.0.0:${port}`)) {
        req.respond(
            setCORS(
                await handleReq(req, dbActions, rootDir, publicUrl, fileUrl)
            )
        )
    }

    await sqlite.save(db)
    db.close()
}
