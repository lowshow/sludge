import * as sqlite from "https://deno.land/x/sqlite/mod.ts"
import { Stream, Hub, Segment, Resolve } from "./common/interfaces.ts"

// TODO: add doc
interface CreateStreamFnArgs {
    id: string
    alias: string
}
type CreateStreamFn = (args: CreateStreamFnArgs) => Promise<Stream | undefined>

// TODO: add doc
interface GetStreamFnArgs {
    alias: string
}
type GetStreamFn = (args: GetStreamFnArgs) => Promise<Stream | undefined>

// TODO: add doc
interface GetSegmentsFnArgs {
    streamId: string
    segmentId?: string
}
type GetSegmentsFn = (args: GetSegmentsFnArgs) => Promise<Segment[] | undefined>

// TODO: add doc
interface AddSegmentFnArgs {
    streamId: string
    url: string
    id: string
}
type AddSegmentFn = (args: AddSegmentFnArgs) => Promise<Segment | undefined>

// TODO: add doc
interface GetHubsFnArgs {
    streamId: string
}
type GetHubsFn = (args: GetHubsFnArgs) => Promise<Hub[] | undefined>

// TODO: add doc
interface AddHubFnArgs {
    id: string
    streamId: string
    url: string
}
type AddHubFn = (args: AddHubFnArgs) => Promise<Hub | undefined>

// TODO: add doc
interface RemoveHubFnArgs {
    id: string
    streamId: string
}
type RemoveHubFn = (args: RemoveHubFnArgs) => Promise<void>

// TODO: add doc
export interface DBActions {
    createStream: CreateStreamFn
    getStream: GetStreamFn
    getSegments: GetSegmentsFn
    addSegment: AddSegmentFn
    getHubs: GetHubsFn
    addHub: AddHubFn
    removeHub: RemoveHubFn
}

enum DT {
    str = "TEXT",
    int = "INTEGER"
}

interface CreateTableQFnArgs {
    table: string
    values: [string, DT][]
}

// TODO: add doc
function createStream(db: sqlite.DB): CreateStreamFn {
    return ({ alias, id }): Promise<Stream | undefined> => {
        return new Promise((resolve: Resolve<Stream | undefined>): void => {
            const stream: Stream = {
                id,
                alias,
                created: Date.now()
            }

            db.query("INSERT INTO streams VALUES ($id, $alias, $created);", {
                $id: stream.id,
                $alias: stream.alias,
                $created: stream.created
            })

            resolve(stream)
        })
    }
}

// TODO: add doc
function getStream(db: sqlite.DB): GetStreamFn {
    return ({ alias }): Promise<Stream | undefined> => {
        return new Promise((resolve: Resolve<Stream | undefined>): void => {
            const rows = db.query(
                "SELECT id, alias, created FROM streams WHERE alias = $alias;",
                { $alias: alias }
            )

            for (const row of rows) {
                if (row) {
                    resolve({
                        id: row[0],
                        alias: row[1],
                        created: row[2]
                    })
                    return
                }
            }

            throw Error(`Did not find stream with alias ${alias}`)
        })
    }
}

// TODO: add doc
function addHub(db: sqlite.DB): AddHubFn {
    return ({ id, url, streamId }): Promise<Hub | undefined> => {
        return new Promise((resolve: Resolve<Hub | undefined>): void => {
            const hub: Hub = {
                id,
                url,
                streamId
            }

            db.query("INSERT INTO hubs VALUES ($id, $url, $streamId);", {
                $id: hub.id,
                $url: hub.url,
                $streamId: hub.streamId
            })

            resolve(hub)
        })
    }
}

// TODO: add doc
function removeHub(db: sqlite.DB): RemoveHubFn {
    return ({ id, streamId }): Promise<void> => {
        return new Promise((resolve: Resolve<void>): void => {
            db.query(
                "DELETE FROM hubs WHERE id = $id AND streamId = $streamId;",
                {
                    $id: id,
                    $streamId: streamId
                }
            )

            resolve()
        })
    }
}

// TODO: add doc
function getHubs(db: sqlite.DB): GetHubsFn {
    return ({ streamId }): Promise<Hub[] | undefined> => {
        return new Promise((resolve: Resolve<Hub[] | undefined>): void => {
            const hubs: Hub[] = []

            const rows = db.query(
                "SELECT id, url, streamId FROM hubs WHERE streamId = $streamId;",
                { $streamId: streamId }
            )

            for (const row of rows) {
                if (row)
                    hubs.push({ id: row[0], url: row[1], streamId: row[2] })
            }

            resolve(hubs)
        })
    }
}

// TODO: add doc
function addSegment(db: sqlite.DB): AddSegmentFn {
    return ({ streamId, url, id }): Promise<Segment | undefined> => {
        return new Promise((resolve: Resolve<Segment | undefined>): void => {
            const segment: Segment = {
                id,
                streamId,
                // base url should finish with /
                url
            }

            db.query("INSERT INTO segments VALUES ($id, $streamId, $url);", {
                $id: segment.id,
                $streamId: segment.streamId,
                $url: segment.url
            })

            resolve(segment)
        })
    }
}

// TODO: add doc
function getSegments(db: sqlite.DB): GetSegmentsFn {
    return ({ streamId, segmentId }): Promise<Segment[] | undefined> => {
        return new Promise((resolve: Resolve<Segment[] | undefined>): void => {
            // if segment id, return all after segment ID
            const segments: Segment[] = []

            if (segmentId) {
                const rows = db.query(
                    "SELECT id, streamId, url FROM segments WHERE streamId = $streamId AND rowid > (SELECT rowid FROM segments WHERE id = $segmentId) LIMIT 10;",
                    {
                        $segmentId: segmentId,
                        $streamId: streamId
                    }
                )

                for (const row of rows) {
                    if (row) {
                        const [id, streamId, url] = row
                        segments.push({ id, streamId, url })
                    }
                }
            } else {
                // if none, get length
                const count = db.query(
                    "SELECT COUNT(*) FROM segments WHERE streamId = $streamId;",
                    {
                        $streamId: streamId
                    }
                )

                if (!count) {
                    resolve([])
                    return
                }

                const value = count.next().value

                const length = value ? value[0] : 0

                if (!length) {
                    resolve([])
                    return
                }

                const rows = db.query(
                    "SELECT id, streamId, url FROM segments WHERE streamId = $streamId LIMIT 10 OFFSET $offset;",
                    {
                        $streamId: streamId,
                        $offset:
                            length > 10 ? ~~(Math.random() * (length - 9)) : 0
                    }
                )

                for (const row of rows) {
                    if (row) {
                        const [id, streamId, url] = row
                        segments.push({ id, streamId, url })
                    }
                }
            }

            resolve(segments)
        })
    }
}

function createTableQ({ table, values }: CreateTableQFnArgs): string {
    return [
        `CREATE TABLE IF NOT EXISTS`,
        table,
        `(${values.map((v) => v.join(" ")).join(", ")})`
    ].join(" ")
}

// TODO: add doc
export function initDb(db: sqlite.DB): sqlite.DB {
    /**
     * id -> public access id for playlist/audio files
     * alias -> secret id for uploads/ streaming
     * created -> datetime stream was generated
     */
    db.query(
        createTableQ({
            table: "streams",
            values: [
                ["id", DT.str],
                ["alias", DT.str],
                ["created", DT.int]
            ]
        }),
        []
    )

    /**
     * id -> id returned from hub for future delete req
     * url -> hub url for finding the stream
     * streamId -> id of linked stream
     */
    db.query(
        createTableQ({
            table: "hubs",
            values: [
                ["id", DT.str],
                ["url", DT.str],
                ["streamId", DT.str]
            ]
        }),
        []
    )

    /**
     * id -> id for audio file segment retrieval
     * streamId -> id of linked stream
     * url -> public url for file request
     */
    db.query(
        createTableQ({
            table: "segments",
            values: [
                ["id", DT.str],
                ["streamId", DT.str],
                ["url", DT.str]
            ]
        }),
        []
    )

    return db
}

// TODO: add doc
export function getDBActions(db: sqlite.DB): DBActions {
    return {
        createStream: createStream(db),
        getStream: getStream(db),
        getHubs: getHubs(db),
        addHub: addHub(db),
        removeHub: removeHub(db),
        getSegments: getSegments(db),
        addSegment: addSegment(db)
    }
}
