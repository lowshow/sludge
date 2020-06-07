import { el, mnt, atr } from "./dom.js";
export function addBtn() {
    return mnt(atr(el("button")).map([
        ["className", btnClass("scale-transition btn-floating btn-large")]
    ]))(atr(el("i")).map([
        ["className", "material-icons black-text"],
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
    return `${classes} waves-effect waves-teal light-green accent-4 black-text`;
}
export function loader() {
    return mnt(atr(el("div")).prop("className")("progress blue"))(atr(el("div")).prop("className")("indeterminate blue darken-4"));
}
export function toast(message) {
    M.toast({ html: message, classes: "blue lighten-1" });
}
export function tabs(children) {
    return mnt(atr(el("ul")).prop("className")("tabs blue-grey tabs-fixed-width"))(children);
}
export function tab({ id, label, active = false }) {
    return mnt(atr(el("li")).prop("className")(`tab col ${active ? "active" : ""}`))(atr(el("a")).map([
        ["className", "black-text"],
        ["href", id],
        ["textContent", label]
    ]));
}
export function coll(children) {
    return mnt(atr(el("ul")).prop("className")("collection"))(children);
}
export function colli({ icon, text }) {
    return mnt(atr(el("li")).prop("className")("collection-item grey darken-3"))(mnt(atr(el("div")).map([["textContent", text]]))([
        mnt(atr(el("button")).map([
            ["className", "btn-small secondary-content"]
        ]))(atr(el("i")).map([
            ["className", "material-icons black-text"],
            ["textContent", icon]
        ]))
    ]));
}
