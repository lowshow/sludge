# sludge &bull; web audio streams

experimental live streaming server

## Setup

### UI

-   Add env data for the UI, in a file at: `ui/public/env.js`

```javascript
export const env = () => ({
    mode: "live",
    streamUI: "https://some.url/splutter"
})
```

### API

-   Before running, ensure files and directories exist:

```shell
make init
```

-   Pass environment variables and run:

```shell
SLUDGE_PUBLIC="http://some.url" SLUDGE_FILES="http://some.url/audio/" make run
```
