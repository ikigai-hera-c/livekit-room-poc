# LiveKit Room POC

A proof-of-concept room communication application built with Next.js and
LiveKit.

Users can select a room, enter with a display name, view room-specific video
streams, and communicate with other participants through LiveKit audio.

## Features

- Card-based room selection
- Dynamic LiveKit access token generation
- Unique participant identity for every connection
- Audio-only LiveKit communication
- MediaMTX WebRTC stream embedding
- HTTP-FLV playback support
- HTTPS and WSS access through Caddy
- Two-stream monitoring layout for `QA-BAC-01`
- Microphone enabled by default
- Custom Talk and Leave controls

## System Architecture

```text
GPC / Dealer video
        |
        v
MediaMTX
192.168.20.22
        |
        | WebRTC / WHEP
        v
Caddy stream proxy
192.168.20.23:8443
        |
        v
Next.js room interface


Browser microphone
        |
        v
Caddy HTTPS / WSS proxy
192.168.20.23
        |
        v
LiveKit Server
127.0.0.1:7880
        |
        v
Participants in the same room
```

## Network Topology

| Host             | Services                               |
| ---------------- | -------------------------------------- |
| `192.168.20.22`  | MediaMTX and GPC/Dealer video streams  |
| `192.168.20.23`  | LiveKit Server and Caddy reverse proxy |
| `192.168.20.246` | Next.js frontend and token API         |

The IP addresses above belong to the current internal POC environment. Update
them when deploying to another network.

## Available Rooms

Rooms are configured in:

```text
src/lib/rooms.ts
```

Current rooms:

- `ARO-001`
- `ARO-002`
- `SBO-001`
- `QA-BAC-01`

## QA-BAC-01 Streams

Stream configuration is stored in:

```text
src/lib/room-streams.ts
```

The current streams are:

| View        | Source                 |
| ----------- | ---------------------- |
| GPC View    | MediaMTX WebRTC player |
| Dealer View | MediaMTX WebRTC player |

Current stream URLs:

```text
GPC View:
https://192.168.20.23:8443/live/qa01_gpc/

Dealer View:
https://192.168.20.23:8443/live/ZCam_16/
```

Both streams are muted in the room interface to avoid audio feedback while
LiveKit handles room communication.

## Prerequisites

Before starting the frontend, make sure the following services are available:

1. MediaMTX streams on `192.168.20.22`
2. LiveKit Server on `192.168.20.23`
3. Caddy on `192.168.20.23`
4. Node.js and npm on the frontend development machine

## 1. Verify MediaMTX

MediaMTX currently runs on:

```text
192.168.20.22
```

Required ports:

| Port   | Purpose     |
| ------ | ----------- |
| `8554` | RTSP        |
| `8888` | HLS         |
| `8889` | WebRTC/WHEP |

Verify the GPC stream:

```bash
ffplay -rtsp_transport tcp rtsp://192.168.20.22:8554/live/qa01_gpc
```

Verify the MediaMTX browser player:

```text
http://192.168.20.22:8889/live/qa01_gpc/
```

Verify the Dealer View:

```text
http://192.168.20.22:8889/live/ZCam_16/
```

## 2. Start LiveKit Server

LiveKit currently runs on:

```text
192.168.20.23
```

The current POC uses the following LiveKit ports:

| Port   | Protocol | Purpose           |
| ------ | -------- | ----------------- |
| `7880` | TCP      | Signaling and API |
| `7881` | TCP      | RTC over TCP      |
| `7882` | UDP      | RTC media         |

SSH to the LiveKit host:

```bash
ssh rnd@192.168.20.23
```

Go to the LiveKit directory:

```bash
cd /home/rnd/hera/livekit
```

Check the existing container:

```bash
docker ps -a --filter name=livekit
```

Start it if it already exists but is stopped:

```bash
docker start livekit
```

Check its status:

```bash
docker ps --filter name=livekit
```

View logs:

```bash
docker logs --tail 100 livekit
```

The current POC uses LiveKit development credentials. Replace these credentials
before using the application outside an isolated development environment.

## 3. Configure Caddy

Caddy runs on:

```text
192.168.20.23
```

Edit:

```text
/etc/caddy/Caddyfile
```

Current POC configuration:

```caddyfile
https://192.168.20.23 {
    tls internal

    handle /rtc* {
        reverse_proxy 127.0.0.1:7880
    }

    handle {
        reverse_proxy 192.168.20.246:3000
    }
}

https://192.168.20.23:8443 {
    tls internal
    reverse_proxy 192.168.20.22:8889
}
```

The main site provides:

- HTTPS access to the Next.js application
- WSS access to LiveKit signaling

Port `8443` proxies MediaMTX player pages so they can be embedded in the HTTPS
application without mixed-content errors.

Format the configuration:

```bash
sudo caddy fmt --overwrite /etc/caddy/Caddyfile
```

Validate it:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
```

Reload Caddy:

```bash
sudo systemctl reload caddy
```

Check its status:

```bash
sudo systemctl status caddy
```

## 4. Trust the Caddy Certificate

Caddy uses an internal CA for the current POC. Client devices must trust the
Caddy root certificate before opening the application.

The certificate is typically stored on the Caddy server at:

```text
/var/lib/caddy/.local/share/caddy/pki/authorities/local/root.crt
```

Copy the certificate to each test device and install it as a trusted root
certificate.

Without a trusted certificate, HTTPS, WSS, microphone access, or embedded
streams may fail.

## 5. Clone the Project

```bash
git clone git@github.com:ikigai-hera-c/livekit-room-poc.git
cd livekit-room-poc
```

Install dependencies:

```bash
npm install
```

## 6. Configure Environment Variables

Create `.env` in the project root:

```env
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
LIVEKIT_URL=wss://192.168.20.23
```

Do not commit `.env`.

Environment files are excluded by `.gitignore`.

The API key and secret are used only by the server-side token API:

```text
src/app/api/token/route.ts
```

They must never be exposed to browser code.

## 7. Configure the Development Hosts

The current development hosts are configured in:

```text
next.config.ts
```

Example:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.20.23', '192.168.20.246'],
  turbopack: {
    root: process.cwd(),
  },
}

export default nextConfig
```

Update `allowedDevOrigins` if the Caddy or frontend host changes.

## 8. Run Code Checks

Format the project:

```bash
npm run format
```

Run ESLint:

```bash
npm run lint
```

Run the production build check:

```bash
npm run build -- --webpack
```

Run all checks together:

```bash
npm run format && \
npm run lint && \
npm run build -- --webpack
```

A production build is not required before every development startup, but it is
recommended before committing or pushing changes.

## 9. Start the Development Server

Start Next.js on all network interfaces:

```bash
npm run dev -- --hostname 0.0.0.0
```

Keep this Terminal running.

The development server listens on:

```text
http://192.168.20.246:3000
```

Users should access the application through Caddy instead of opening the
development server directly.

## 10. Open the Application

Open:

[Open LiveKit Room POC](https://192.168.20.23)

On macOS, open it from another Terminal:

```bash
open https://192.168.20.23
```

The `npm run dev` command does not automatically open a browser.

Do not use the frontend machine's plain HTTP network address for microphone
testing. Browser media devices require HTTPS or localhost.

## Recommended Startup Order

Start the components in this order:

1. Start or verify MediaMTX streams on `192.168.20.22`.
2. Start the LiveKit Server on `192.168.20.23`.
3. Start or reload Caddy on `192.168.20.23`.
4. Start Next.js on `192.168.20.246`.
5. Open `https://192.168.20.23`.
6. Allow microphone access.
7. Join the same room from two devices.

## Access Token Flow

The frontend does not use a shared static token.

When a user enters a room:

1. The browser sends the room name and display name to `/api/token`.
2. The Next.js server validates the requested room.
3. The server generates a unique participant identity.
4. The server generates a short-lived LiveKit access token.
5. The browser connects to LiveKit using the generated token.

Each participant receives a unique identity, preventing users from disconnecting
each other by sharing the same LiveKit identity.

## Talk Control

The microphone is enabled when the user enters a room.

The `Talk` button currently toggles the user's LiveKit room microphone.

Current behavior:

```text
Enter room:
Microphone ON

Click Talk:
Microphone OFF

Click Talk again:
Microphone ON
```

The current `Talk` button is not yet a separate GPC intercom channel or
push-to-talk control.

## Troubleshooting

### Microphone is unavailable

Make sure the application is opened through:

```text
https://192.168.20.23
```

Microphone access does not work through a plain HTTP network IP.

Check the browser's site permissions and allow microphone access.

### LiveKit connection fails

Verify:

- LiveKit is running on `192.168.20.23`
- Caddy is running
- `LIVEKIT_URL` uses `wss://`
- The Caddy root certificate is trusted
- TCP `7881` and UDP `7882` are reachable

Check LiveKit logs:

```bash
docker logs --tail 100 livekit
```

### Stream does not load

Open the MediaMTX player directly:

```text
http://192.168.20.22:8889/live/qa01_gpc/
```

Then test the HTTPS proxy:

```text
https://192.168.20.23:8443/live/qa01_gpc/
```

If the direct URL works but the HTTPS URL fails, inspect Caddy.

### Next.js HMR is blocked

Add the required development hosts to:

```text
next.config.ts
```

Then restart the development server.

### Token API fails

Check that `.env` contains:

```env
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
LIVEKIT_URL=
```

Restart Next.js after changing `.env`.

## Security Notes

This project is currently intended for an internal POC.

Before production use:

- Replace LiveKit development credentials
- Use a trusted domain and certificate
- Add authentication and authorization
- Protect the token API
- Add API rate limiting
- Restrict allowed rooms per user
- Restrict CORS and development origins
- Remove hardcoded internal IP addresses
- Move stream configuration to a managed service
- Never commit API secrets or generated access tokens

## Known Limitations

- Room configuration is hardcoded
- Stream URLs are hardcoded
- The token API has no user authentication
- Caddy uses an internal CA
- Talk currently toggles the normal room microphone
- GPC audio over LiveKit is not implemented yet
- The current configuration is intended for an internal network only
