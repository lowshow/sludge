import {
    serve,
    ServerRequest,
    Response
} from "https://deno.land/std/http/server.ts"
import {
    MultipartReader,
    MultipartFormData,
    FormFile
} from "https://deno.land/std/mime/multipart.ts"
import { v4 } from "https://deno.land/std/uuid/mod.ts"
import { Segment } from "./common/interfaces.ts"
import * as path from "https://deno.land/std/path/mod.ts"
import * as sqlite from "https://deno.land/x/sqlite/mod.ts"
import { initDb, DBActions, getDBActions } from "./db.ts"

// TODO: add doc
async function loadFile(r: MultipartReader): Promise<void> {
    const data: MultipartFormData = await r.readForm()
    const formFile: FormFile | undefined = data.file("audio")
    // we have the file data, connection can close now
    if (!formFile || !formFile.content) return
    const uuid = v4.generate()
    const file = await Deno.open(`out/${uuid}.opus`, {
        write: true,
        create: true
    })
    await Deno.write(file.rid, formFile.content)
    Deno.close(file.rid)
    Promise.resolve()
    const list = await Deno.open(`out/list`, {
        write: true,
        create: true,
        append: true
    })
    await list.write(new TextEncoder().encode(`${uuid}\n`))
    Deno.close(list.rid)
}

// TODO: add doc
async function handleForm(req: ServerRequest): Promise<Response> {
    const type: string | null = req.headers.get("content-type")
    if (!type) {
        return {
            body: new TextEncoder().encode("Missing content type header\n"),
            status: 400
        }
    }
    // boundaries are used to communicate request data structure
    // https://www.w3.org/TR/html401/interact/forms.html#h-17.13.4.2
    const boundary: string = type.substr(type.indexOf("=") + 1)
    // need to wait before response, otherwise connection will close
    // before we have all the data!
    const reader: MultipartReader = new MultipartReader(req.r, boundary)
    await loadFile(reader)
    return { body: new TextEncoder().encode("Success\n"), status: 200 }
}

async function createStream(
    dbActions: DBActions,
    rootDir: string
): Promise<Response> {
    const id: string = v4.generate()
    const pass: string = v4.generate()
    // create dir
    const dirPath: string = path.join(rootDir, "data", id)
    const dir = await Deno.mkdir(dirPath, { recursive: true })
    // add pass/id to file/store

    // return public path for upload/ UI/ public stream
    return {
        status: 200
    }
}

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
    rootDir: string
): Promise<Response> {
    const path: string[] = req.url.split("/")
    try {
        if (!v4.validate(path[1])) {
            throw Error("Invalid path")
        }

        if (path[1] === "") {
            // create stream id
            return await createStream(dbActions, rootDir)
        }

        // if 1 is a uuid
        // post adds file
        // need to match uuid in KV
        return await handleForm(req)
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
    rootDir: string
): Promise<Response> {
    switch (req.method) {
        case "GET":
            return await handleGet(req, dbActions)
        case "POST":
            return await handlePost(req, dbActions, rootDir)
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
    filesUrl: string
): Promise<void> {
    // const { getState, stop } = fileState(publicUrl)

    // save on end
    const db: sqlite.DB = await sqlite.open(dbPath)
    const dbActions: DBActions = getDBActions(initDb(db))

    for await (const req of serve(`0.0.0.0:${port}`)) {
        req.respond(setCORS(await handleReq(req, dbActions, rootDir)))
    }

    // stop()
    await sqlite.save(db)
    db.close()
}
