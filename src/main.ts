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
import { readFileStr } from "https://deno.land/std/fs/read_file_str.ts"
import { Resolve } from "./common/interfaces.ts"

// TODO: add doc
type GetState = (id?: string) => string[][]

// TODO: add doc
interface FileState {
    stop: () => void
    getState: GetState
}

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

// TODO: add doc
function fileState(publicUrl: string): FileState {
    const files: string[] = []
    // Aiming for "eventual" consistency
    const interval = setInterval(async () => {
        // File must exist first
        const content: string = await readFileStr("out/list")
        const list: string[] = content
            .split("\n")
            .filter((item: string) => item !== "")
            .splice(files.length)
        list.forEach((item: string): void => {
            files.push(item)
        })
    }, 500)

    return {
        stop: () => {
            clearInterval(interval)
        },
        getState: (from: string = "") => {
            const index = from === "" ? 0 : files.indexOf(from) + 1
            if (index === -1) {
                throw Error("Invalid file ID.")
            } else if (index === files.length) {
                return []
            } else {
                const list: string[] = files.splice(index)
                return list.map((item: string): string[] => [
                    item,
                    `${publicUrl}/audio/${item}.opus`
                ])
            }
        }
    }
}

// TODO: add doc
function audioFile(req: ServerRequest, fileName: string): Promise<Response> {
    return new Promise(
        async (resolve: Resolve<Response>): Promise<void> => {
            const filePath: string = `out/${fileName}`
            // TODO: if file doesn't exist..
            const [file, fileInfo] = await Promise.all([
                Deno.open(filePath),
                Deno.stat(filePath)
            ])
            const headers = new Headers()
            headers.set("content-length", fileInfo.size.toString())
            headers.set("content-type", "audio/ogg")
            resolve({
                status: 200,
                body: file,
                headers
            })
            await req.done
            // always close the file when done reading
            Deno.close(file.rid)
        }
    )
}

// TODO: add doc
async function handleReq(req: ServerRequest, get: GetState): Promise<Response> {
    req.done
    switch (req.method) {
        case "GET":
            try {
                const path: string[] = req.url.split("/")
                if (path[1] === "audio") {
                    return await audioFile(req, path[2])
                } else {
                    const idList: string[][] = get(path[1])
                    const headers = new Headers()
                    headers.set("content-type", "application/json")
                    return {
                        body: new TextEncoder().encode(JSON.stringify(idList)),
                        status: 200,
                        headers
                    }
                }
            } catch (e) {
                return {
                    body: new TextEncoder().encode(e.message),
                    status: 404
                }
            }
        case "POST":
            return await handleForm(req)
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
async function main(publicUrl: string): Promise<void> {
    const { getState, stop } = fileState(publicUrl)

    for await (const req of serve("0.0.0.0:8000")) {
        req.respond(setCORS(await handleReq(req, getState)))
    }

    stop()
}

main("http://0.0.0.0:8000")
