import { streamsSel, vStreamsSel } from "./stream.js";
import { tabs, tab, collW, coll, row, col12, btnClass, toast } from "./atoms.js";
import { copyURL, nextTick } from "./util.js";
import { mnt, el, atr, emt, lstn, cls } from "./dom.js";
import { onDiff } from "./state.js";
import { vHubsSel } from "./hub.js";
function tabInner({ child, id }) {
    return mnt(el("div", { attr: { className: "tab_inner black", id } }))(child);
}
function hubList({ state: { updateState, getState, subscribe } }) {
    const input = atr(el("input")).map([
        ["type", "url"],
        ["className", "white-text validate"],
        ["id", "addHubInput"]
    ]);
    const add = mnt(cls(el("form"))("form"))([
        mnt(atr(el("div")).prop("className")("input-field"))([
            input,
            atr(el("label")).map([
                ["htmlFor", "addHubInput"],
                ["textContent", "Add hub URL"]
            ])
        ]),
        atr(el("button")).map([
            ["type", "submit"],
            ["textContent", "Submit"],
            ["className", btnClass("btn")]
        ])
    ]);
    lstn(input)
        .on("invalid")
        .do(() => {
        if (!input.validity.valid) {
            toast(input.validationMessage);
            return;
        }
    });
    lstn(add)
        .on("submit")
        .do((event) => {
        event.preventDefault();
        updateState({ addHub: input.value });
    });
    const collapse = (viewHubs) => {
        if (!viewHubs.length)
            return el("div");
        const inner = collW(viewHubs.map((hub, index) => {
            const item = coll({
                label: `Hub ${index + 1}`,
                btnLabel: "Delete",
                onButtonClick: () => {
                    updateState({ rmHub: hub.id });
                },
                text: hub.url
            });
            return item;
        }));
        return mnt(el("div", {
            onMount: () => {
                nextTick(() => {
                    M.Collapsible.init(inner);
                });
            }
        }))(inner);
    };
    const listWrap = col12(collapse(vHubsSel(getState())));
    const listMnt = mnt(listWrap);
    subscribe((oldState) => {
        onDiff({
            current: getState(),
            previous: oldState,
            selector: vHubsSel
        }).do((h) => {
            emt(listWrap);
            listMnt(collapse(h));
        });
    });
    return mnt(el("div"))([col12(add), listWrap]);
}
function buildStreamList({ current, state }) {
    const tabsEl = tabs([
        tab({
            label: `Info`,
            id: `#streamInfo`,
            active: true
        }),
        tab({
            label: `Hubs`,
            id: `#hubs`,
            active: false
        })
    ]);
    const collapse = collW([
        coll({
            label: "Admin",
            btnLabel: "Copy",
            onButtonClick: () => {
                copyURL(current.admin);
            },
            text: `<input class="url" type="text" value="${current.admin}" />GET: Retrieve these URLs.<br />POST: Upload audio stream segment.`
        }),
        coll({
            label: "Download",
            btnLabel: "Copy",
            onButtonClick: () => {
                copyURL(current.download);
            },
            text: `<input class="url" type="text" value="${current.download}" />GET: Retrieve stream segment playlist.`
        }),
        coll({
            label: "Hubs",
            btnLabel: "Copy",
            onButtonClick: () => {
                copyURL(current.hub);
            },
            text: `<input class="url" type="text" value="${current.hub}" />GET: Retrieve stream hubs.<br />PUT: Add hub to stream.<br />DELETE: Remove hub from stream.`
        })
    ]);
    const wrap = mnt(el("div", {
        onMount: () => {
            nextTick(() => {
                M.Tabs.init(tabsEl, { swipeable: true });
                M.Collapsible.init(collapse);
            });
        }
    }))(row([
        col12([
            tabsEl,
            tabInner({ child: col12(collapse), id: "streamInfo" }),
            tabInner({ child: hubList({ state }), id: "hubs" })
        ])
    ]));
    return wrap;
}
export function streamsDD({ state: { getState, updateState, subscribe } }) {
    const view = row(col12(el("div")));
    const viewMnt = mnt(view);
    function inner(streams) {
        if (!streams)
            return [];
        const sel = mnt(atr(el("select")).map([
            ["className", "dropdown_select black white-text"]
        ]))(streams.map((_, i) => atr(el("option")).map([
            ["textContent", `Stream ${i + 1}`],
            ["value", i],
            ["selected", i === streams.length - 1 ? "selected" : ""]
        ])));
        lstn(sel)
            .on("click")
            .do(() => {
            updateState({ viewStreamIndex: parseInt(sel.value, 10) });
        });
        return [sel];
    }
    subscribe((oldState) => {
        const current = getState();
        onDiff({
            current,
            previous: oldState,
            selector: streamsSel
        }).do((streams) => {
            emt(view);
            viewMnt(inner(streams));
        });
    });
    return viewMnt(inner(streamsSel(getState())));
}
export function listViewGen({ state }) {
    const { getState, subscribe } = state;
    const dd = streamsDD({ state });
    const viewInner = el("div");
    const view = mnt(el("div"))([dd, viewInner]);
    const viewMnt = mnt(viewInner);
    subscribe((oldState) => {
        const current = getState();
        onDiff({
            current,
            previous: oldState,
            selector: streamsSel
        }).do((s) => {
            emt(viewInner);
            viewMnt(buildStreamList({ current: s[vStreamsSel(current)], state }));
        });
        onDiff({
            current,
            previous: oldState,
            selector: vStreamsSel
        }).do((index) => {
            emt(viewInner);
            viewMnt(buildStreamList({ current: streamsSel(current)[index], state }));
        });
    });
    return view;
}
