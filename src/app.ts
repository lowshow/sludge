import { main } from "./main.ts"
import * as path from "https://deno.land/std/path/mod.ts"
import * as fs from "https://deno.land/std/fs/mod.ts"
import { parse, Args } from "https://deno.land/std/flags/mod.ts"
;(async () => {
    try {
        const flags: Args = parse(Deno.args)
        const reqArgs: string[] = ["dir", "port", "public", "files"]
        const flagKeys: string[] = Object.keys(flags)
        const invalidArgs: string[] = reqArgs.reduce<string[]>((p, a) => {
            if (!flagKeys.includes(a)) {
                p.push(`Missing arg: ${a}`)
            }
            return p
        }, [])
        if (invalidArgs.length) {
            throw Error(invalidArgs.join("\n"))
        }
        const rootDir: string = flags.dir
        // use db file for sqlite db
        const dbPath: string = path.join(rootDir, "db")
        if (!fs.exists(dbPath)) {
            await Deno.create(dbPath)
        }
        // get public url and port from args
        main({
            dbPath,
            fileUrl: flags.files,
            port: flags.port,
            publicUrl: flags.public,
            rootDir
        })
    } catch (e) {
        console.error(e)
    }
})()
