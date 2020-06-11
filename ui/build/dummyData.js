function* _dummyStreamDataURL() {
    for (let i = 0; i < 100; i++) {
        const id = "81b288a6-0ff0-4f2e-ac50-abbc42b1dde";
        const data = {
            hub: `https://some.url/${id}${i}/hubs`,
            admin: `https://some.url/${id}${i}/admin`,
            download: `https://some.url/${id}${i}/download`
        };
        yield URL.createObjectURL(new Blob([JSON.stringify(data)], {
            type: "application/json"
        }));
    }
}
export const dummyStreamDataURL = _dummyStreamDataURL();
function* _dummyHubDataURL() {
    for (let i = 0; i < 100; i++) {
        const data = [];
        for (let j = 0; j < i; j++) {
            const id = `81b288a6-0ff0-4f2e-ac50-abbc42b1dde${i + j}`;
            data.push({
                id,
                url: `https://some.url/${id}`
            });
        }
        yield URL.createObjectURL(new Blob([JSON.stringify(data)], {
            type: "application/json"
        }));
    }
}
export const dummyHubDataURL = _dummyHubDataURL();
