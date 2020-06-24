# sludge &bull; web audio streams

experimental live streaming server

## Summary

This project is a component of [\_noisecrypt](low.show/noisecrypt/). The component acts as the streaming server where recorded audio is live streamed to, and then served from to be consumed by a compatible system. Streams are created via the sludge UI (or API) and can be added to a [sortition](https://github.com/lowshow/sortition) hub using the same UI. The recording/encoding interface is part of the [splutter](https://github.com/lowshow/splutter) component. The decoding/playback interface is part of the [syllid](https://github.com/lowshow/syllid) component.

### Component communication

-   sludge communicates information to splutter via local storage, due to shared root domain
-   sortition hub urls are copied into "add hub" section of the sludge admin UI

## Install

-   Download [deno](https://deno.land/) (tested with v1.1.0)

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

NOTE: You will need to provide values for these variables

**Nginx port**

This is the port from which the nginx proxy server for sludge will run

**Service hostname**

This is the base URL hostname where sludge will be accessed

**Additional hostnames**

More hostnames (not required)

**Sludge port**

Port to run the sludge deno app

**Public url**

The URL (including any paths, without trailing slash) where sludge app is accessed

**Files url**

Base URL (including any paths, **with** trailing slash) where audio file segments are accessed

**Splutter url**

Full URL for the splutter app associated with this sludge instance (they must belong on the same domain)

#### Dev

-   Pass environment variables and run:

```shell
SLUDGE_PUBLIC="http://some.url/" SLUDGE_FILES="http://some.url/audio/" SLUDGE_PORT="8000" make run
```

NOTE: trailing slash should be included at the end of the URLs
