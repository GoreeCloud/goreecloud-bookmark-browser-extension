# GoreeCloud Bookmarks Browser Extension Validation Baseline

This document defines the minimum validation expected before the GoreeCloud browser-extension identity branch can be merged or distributed.

## Current scope

- Repository: `GoreeCloud/goreecloud-bookmark-browser-extension`
- Working branch: `feature/goreecloud-identity`
- Upstream basis: `linkwarden/browser-extension` v1.5.4
- Baseline commit: `3175f85191bab62d84873c46e54b32ab958f9be8`

## Reproducible install, lint, and build

```bash
npm ci
npm run lint
npm run build
```

The build output is expected in `dist/`. The build must not require reusable GoreeCloud credentials in source code.

The repository includes `.github/workflows/ci.yml` to run the same lint/build baseline on supported GitHub Actions events when Actions are enabled.

## Firefox development validation

Load the generated `dist/` directory as a temporary/unpacked extension using Firefox's development-extension workflow, then validate the following against an approved private GoreeCloud Bookmarks test instance:

1. Extension name is **GoreeCloud Bookmarks**.
2. Popup and setup screens use GoreeCloud Bookmarks identity.
3. Settings begin with no upstream cloud service preconfigured.
4. Instance URL can be configured to the intended HTTPS GoreeCloud Bookmarks endpoint.
5. Username/password authentication succeeds when enabled.
6. API-key/access-token authentication succeeds when enabled.
7. Current-page capture succeeds.
8. Collection selection and tag loading work.
9. Optional description/note behavior remains functional.
10. Duplicate detection behaves as expected.
11. Context-menu capture succeeds.
12. Save-all-tabs behavior succeeds where supported.
13. Popup settings and application links open the configured destination correctly.
14. Reset/logout clears local extension configuration and cached bookmark metadata as intended.
15. Revoked credentials can no longer access the instance.
16. No unrelated browsing data is transmitted as part of normal user-initiated capture.

## Identity and packaging validation

Before a GoreeCloud release:

- Replace the remaining upstream raster toolbar/extension-management icons (`16.png`, `32.png`, `48.png`, `128.png`) with approved GoreeCloud assets.
- Confirm visible context-menu, popup, options, and omnibox text uses GoreeCloud Bookmarks naming.
- Preserve required MIT license and upstream provenance notices.
- Review requested permissions and host permissions separately from visual rebranding.
- Do not change Firefox signing identity, browser-store identifiers, update metadata, or Safari bundle identifiers without a documented packaging/signing decision.

## Safari boundary

Safari conversion, Xcode project naming, bundle identifiers, signing, and Safari-specific raster assets remain a separate validation track. A successful Chrome/Firefox build is not evidence that a Safari package is ready for distribution.

## Release gate

Do not merge or distribute this branch until lint, build, Firefox installation, authentication, capture, reset/logout, credential revocation, and the relevant identity checks have been recorded as successful. A draft pull request is not release approval.
