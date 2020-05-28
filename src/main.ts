import {
    serve,
    ServerRequest,
    Response
} from "https://deno.land/std/http/server.ts"
import { v4 } from "https://deno.land/std/uuid/mod.ts"
import { Segment, Hub } from "./common/interfaces.ts"
import * as sqlite from "https://deno.land/x/sqlite/mod.ts"
import { initDb, DBActions, getDBActions } from "./db.ts"
import { handleForm } from "./upload.ts"
import { createStream } from "./stream.ts"
import { addHub, getHubs, removeHub } from "./hub.ts"

// TODO: add doc
export interface MainFnArgs {
    publicUrl: string
    port: string
    rootDir: string
    dbPath: string
    fileUrl: string
}

// TODO: add doc
interface HandleGetFnArgs {
    req: ServerRequest
    dbActions: DBActions
}

// TODO: add doc
interface HandlePostFnArgs {
    req: ServerRequest
    dbActions: DBActions
    rootDir: string
    publicUrl: string
    fileUrl: string
}

// TODO: add doc
interface HandlePutFnArgs {
    req: ServerRequest
    dbActions: DBActions
    publicUrl: string
}

// TODO: add doc
interface HandleDeleteFnArgs {
    req: ServerRequest
    dbActions: DBActions
}

// TODO: add doc
interface HandleReqFn {
    req: ServerRequest
    dbActions: DBActions
    rootDir: string
    publicUrl: string
    fileUrl: string
}

// TODO: add doc
async function handleGet({
    dbActions,
    req
}: HandleGetFnArgs): Promise<Response> {
    const path: string[] = req.url.split("/")
    try {
        if (!v4.validate(path[1])) {
            throw Error("Invalid path")
        }

        const headers = new Headers()
        headers.set("content-type", "application/json")

        // /<stream alias>/hubs
        if (path[2] === "hubs") {
            const hubs: Hub[] = await getHubs({
                dbActions,
                streamAlias: path[1]
            })
            return {
                body: new TextEncoder().encode(
                    JSON.stringify(
                        hubs.map((hub) => ({ id: hub.id, url: hub.url }))
                    )
                ),
                status: 200,
                headers
            }
        }

        // return playlist
        // /<stream id>/<segment?>
        const idList: Segment[] = await dbActions.getSegments({
            streamId: path[1],
            segmentId: v4.validate(path[2]) ? path[2] : undefined
        })

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
async function handlePost({
    dbActions,
    fileUrl,
    publicUrl,
    req,
    rootDir
}: HandlePostFnArgs): Promise<Response> {
    const path: string[] = req.url.split("/")

    try {
        if (path[1] === "stream" && !path[2]) {
            // create stream id
            return await createStream({ dbActions, rootDir, publicUrl })
        }

        if (!v4.validate(path[1])) {
            throw Error("Invalid path")
        }

        // /<stream alias>
        // post adds file
        // need to match uuid in KV
        return await handleForm({
            req,
            dbActions,
            rootDir,
            fileUrl,
            alias: path[1]
        })
    } catch (e) {
        return {
            body: new TextEncoder().encode(e.message),
            status: 404
        }
    }
}

// handle hub put
async function handlePut({
    req,
    dbActions,
    publicUrl
}: HandlePutFnArgs): Promise<Response> {
    const path: string[] = req.url.split("/")
    try {
        if (!v4.validate(path[1])) {
            throw Error("Invalid path")
        }

        if (!req.contentLength) {
            throw Error("No data")
        }

        const hubUrl: string = new TextDecoder().decode(
            await Deno.readAll(req.body)
        )

        // /<stream alias>
        // get hub url from body
        const hub: Hub = await addHub({
            dbActions,
            hubUrl,
            publicUrl,
            streamAlias: path[1]
        })

        return {
            body: new TextEncoder().encode(hub.id),
            status: 200
        }
    } catch (e) {
        return {
            body: new TextEncoder().encode(e.message),
            status: 404
        }
    }
}

// handle hub delete
async function handleDelete({
    req,
    dbActions
}: HandleDeleteFnArgs): Promise<Response> {
    const path: string[] = req.url.split("/")
    try {
        if (!v4.validate(path[1])) {
            throw Error("Invalid path")
        }

        if (!req.contentLength) {
            throw Error("No data")
        }

        const id: string = new TextDecoder().decode(
            await Deno.readAll(req.body)
        )

        // /<stream alias>
        // get hub id from body
        await removeHub({
            dbActions,
            id,
            streamAlias: path[1]
        })

        return {
            status: 200
        }
    } catch (e) {
        return {
            body: new TextEncoder().encode(e.message),
            status: 404
        }
    }
}

// TODO: add docs
/**
 * path to get stream create UI
 * path to create stream id
 * path to upload audio segments
 * path to get id playlist
 * add/remove/get hubs
 */
// nginx static routes
// if /stream
// get 2 = uuid, return splutter for streaming ui
// need to match uuid in KV
// if /
// get ui to create stream
// if /audio/streamId/segmentId
// let nginx return audio files from dir
async function handleReq({
    dbActions,
    fileUrl,
    publicUrl,
    req,
    rootDir
}: HandleReqFn): Promise<Response> {
    switch (req.method) {
        case "GET":
            return await handleGet({ req, dbActions })
        case "POST":
            return await handlePost({
                req,
                dbActions,
                rootDir,
                publicUrl,
                fileUrl
            })
        case "PUT":
            return await handlePut({ dbActions, publicUrl, req })
        case "DELETE":
            return await handleDelete({ dbActions, req })
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
export async function main({
    dbPath,
    fileUrl,
    port,
    publicUrl,
    rootDir
}: MainFnArgs): Promise<void> {
    const db: sqlite.DB = await sqlite.open(dbPath)
    const dbActions: DBActions = getDBActions(initDb(db))

    const server = serve(`0.0.0.0:${port}`)

    for await (const req of server) {
        req.respond(
            setCORS(
                await handleReq({ req, dbActions, rootDir, publicUrl, fileUrl })
            )
        )
        sqlite.save(db)
    }

    db.close()
    server.close()
}
