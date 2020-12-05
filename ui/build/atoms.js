import { el, mnt, atr, lstn } from "./dom.js";
export function addBtn() {
    return mnt(atr(el("button")).map([
        ["className", btnClass("scale-transition btn-floating btn-large")]
    ]))(atr(el("i")).map([
        ["className", "material-icons"],
        ["textContent", "add"]
    ]));
}
export function row(children) {
    return mnt(atr(el("div")).prop("className")("row"))(children);
}
export function col12(children) {
    return mnt(atr(el("div")).prop("className")("col s12"))(children);
}
export function btnClass(classes) {
    return `${classes} Button_click`;
}
export function loader() {
    return mnt(atr(el("div")).prop("className")("progress blue"))(atr(el("div")).prop("className")("indeterminate blue darken-4"));
}
export function toast(message) {
    M.toast({ html: message, classes: "blue lighten-1" });
}
export function tabs(children) {
    return mnt(atr(el("ul")).prop("className")("tabs dark300 tabs-fixed-width"))(children);
}
export function tab({ id, label, active = false }) {
    return mnt(atr(el("li")).prop("className")(`tab ${active ? "active" : ""}`))(atr(el("a")).map([
        ["href", id],
        ["textContent", label],
        ["className", "Button_click"]
    ]));
}
export function iterW(children) {
    return mnt(atr(el("ul")).prop("className")("collection"))(children);
}
export function iter({ icon, text }) {
    return mnt(atr(el("li")).prop("className")("collection-item black"))(mnt(atr(el("div")).map([["textContent", text]]))([
        mnt(atr(el("button")).map([
            ["className", "btn-small secondary-content"]
        ]))(atr(el("i")).map([
            ["className", "material-icons black-text"],
            ["textContent", icon]
        ]))
    ]));
}
export function collW(children) {
    return mnt(atr(el("ul")).prop("className")("collapsible"))(children);
}
export function coll({ label, btnLabel, onButtonClick, text }) {
    const btn = atr(el("button")).map([
        ["textContent", btnLabel],
        ["className", btnClass("")]
    ]);
    lstn(btn)
        .on("click")
        .do((event) => {
        event.preventDefault();
        event.stopPropagation();
        onButtonClick();
    });
    return mnt(el("li"))([
        mnt(atr(el("div")).prop("className")("collapsible-header dark300 spaced"))([atr(el("span")).prop("textContent")(label), btn]),
        mnt(atr(el("div")).prop("className")("collapsible-body"))(atr(el("span")).prop("innerHTML")(text))
    ]);
}
