import { el, mnt, umnt } from "./dom.js";
// TODO: add doc
export function randInt(from, to) {
    if (to < from)
        return from;
    return ~~(Math.random() * (to - from) + from);
}
// TODO: add doc
export function sleep(seconds) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), seconds * 1000);
    });
}
export function slsh(url) {
    return url.endsWith("/") ? url : `${url}/`;
}
export function last(arr) {
    return arr[arr.length - 1];
}
export function copyURL(value) {
    const txt = el("textarea");
    txt.value = value;
    txt.setAttribute("readonly", "");
    txt.style.position = "absolute";
    txt.style.left = "-9999px";
    mnt(document.body)(txt);
    const sel = document.getSelection();
    const selected = sel !== null && sel.rangeCount > 0 ? sel.getRangeAt(0) : undefined;
    txt.select();
    document.execCommand("copy");
    umnt(txt);
    if (sel && selected) {
        sel.removeAllRanges();
        sel.addRange(selected);
    }
}
export function nextTick(fn) {
    setTimeout(fn, 0);
}
