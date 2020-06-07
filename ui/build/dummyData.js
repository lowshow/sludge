export function dummyStreamDataURL() {
    const id = "81b288a6-0ff0-4f2e-ac50-abbc42b1dde8";
    const data = {
        hub: `https://some.url/${id}/hubs`,
        playlist: id,
        stream: id,
        streamUI: "https://some.url"
    };
    return URL.createObjectURL(new Blob([JSON.stringify(data)], {
        type: "application/json"
    }));
}
