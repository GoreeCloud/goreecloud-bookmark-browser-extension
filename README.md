# GoreeCloud Bookmarks Browser Extension

GoreeCloud Bookmarks Browser Extension is the browser-integration component for the GoreeCloud Bookmarks project. It is maintained as a fork of the official [Linkwarden browser extension](https://github.com/linkwarden/browser-extension).

> [!IMPORTANT]
> This GoreeCloud fork is currently under development. It has not yet been approved for production use, signed as a GoreeCloud Firefox release, or published to a browser extension store.

## Current upstream base

- Upstream: `linkwarden/browser-extension`
- Baseline version: `1.5.4`
- Baseline commit: `3175f85191bab62d84873c46e54b32ab958f9be8`
- License: MIT

See [`GOREECLOUD.md`](./GOREECLOUD.md) for the GoreeCloud fork record, maintenance policy, security boundary, and packaging constraints.

## Intended GoreeCloud role

The extension is intended to provide fast, user-initiated capture into a private GoreeCloud Bookmarks account. The initial GoreeCloud target includes:

- Save the current page.
- Choose a destination collection.
- Add tags.
- Add an optional note.
- Display the page title and URL before saving.
- Detect an already-saved URL when practical.
- Open GoreeCloud Bookmarks.
- Authenticate securely to an approved private GoreeCloud Bookmarks deployment.

Later opportunities may include selected-text capture, context-menu actions, saving all open tabs, keyboard shortcuts, highlight capture, Firefox sidebar integration, and a quick Read Later action.

## Development boundary

The first identity pass changes user-visible GoreeCloud naming while intentionally preserving upstream technical identifiers that require a separate packaging or signing decision. In particular, Firefox signing identity, browser-store identifiers, update metadata, authentication behavior, and production server configuration must not be changed accidentally as part of visual rebranding.

## Build from source

### Requirements

The upstream project currently documents the following build prerequisites:

- LTS Node.js 18.x
- npm 9.x
- Bash
- Git

### Clone this fork

```bash
git clone https://github.com/GoreeCloud/goreecloud-bookmark-browser-extension.git
cd goreecloud-bookmark-browser-extension
```

### Build

```bash
npm install
npm run build
```

After a successful build, the generated `/dist` directory can be used for development testing as an unpacked/temporary extension according to the browser's development-extension workflow.

Build, lint, installation, authentication, capture, logout, and revocation testing remain required before a GoreeCloud release is approved.

## Upstream attribution

This project is derived from Linkwarden's browser extension. GoreeCloud branding does not remove the upstream project's copyright or MIT license obligations. Required notices and provenance will be preserved as the fork evolves.
