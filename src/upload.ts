import {
    MultipartReader,
    MultipartFormData,
    FormFile
} from "https://deno.land/std/mime/multipart.ts"
import { v4 } from "https://deno.land/std/uuid/mod.ts"
import { ServerRequest, Response } from "https://deno.land/std/http/server.ts"
import { Stream } from "./common/interfaces.ts"
import { DBActions } from "./db.ts"
import * as path from "https://deno.land/std/path/mod.ts"

// TODO: add doc
async function loadFile(
    r: MultipartReader,
    dbActions: DBActions,
    rootDir: string,
    fileUrl: string,
    streamId: string
): Promise<void> {
    const data: MultipartFormData = await r.readForm()
    const formFile: FormFile | undefined = data.file("audio")
    // we have the file data, connection can close now
    if (!formFile || !formFile.content) return
    const id = v4.generate()
    const filePath: string = path.join(rootDir, "audio", streamId, `${id}.opus`)
    const file = await Deno.open(filePath, {
        write: true,
        create: true
    })
    await Deno.write(file.rid, formFile.content)
    Deno.close(file.rid)
    Promise.resolve()
    await dbActions.addSegment({
        id,
        streamId,
        url: new URL(`${streamId}/${id}`, fileUrl).toString()
    })
}

// TODO: add doc
export async function handleForm(
    req: ServerRequest,
    dbActions: DBActions,
    rootDir: string,
    fileUrl: string,
    alias: string
): Promise<Response> {
    const type: string | null = req.headers.get("content-type")
    if (!type) {
        return {
            body: new TextEncoder().encode("Missing content type header\n"),
            status: 400
        }
    }

    try {
        const stream: Stream = await dbActions.getStream({ alias })
        // boundaries are used to communicate request data structure
        // https://www.w3.org/TR/html401/interact/forms.html#h-17.13.4.2
        const boundary: string = type.substr(type.indexOf("=") + 1)
        // need to wait before response, otherwise connection will close
        // before we have all the data!
        const reader: MultipartReader = new MultipartReader(req.r, boundary)
        await loadFile(reader, dbActions, rootDir, fileUrl, stream.id)
        return { body: new TextEncoder().encode("Success\n"), status: 200 }
    } catch (e) {
        return {
            body: new TextEncoder().encode(e.message),
            status: 400
        }
    }
}
