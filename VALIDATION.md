# GoreeCloud Bookmarks Browser Extension Validation Baseline

This document defines the minimum validation expected before GoreeCloud browser-extension branches can be merged or distributed.

## Current scope

- Repository: `GoreeCloud/goreecloud-bookmark-browser-extension`
- Upstream basis: `linkwarden/browser-extension` v1.5.4
- Baseline commit: `3175f85191bab62d84873c46e54b32ab958f9be8`
- Identity branch: `feature/goreecloud-identity`
- Glaze UI branch: `feature/goreecloud-glaze-ui`
- Firefox security branch: `security/firefox-permission-model`
- Companion server security branch: `GoreeCloud/goreecloud-bookmarks` → `security/browser-extension-session-scope`

## Reproducible install, lint, and build

```bash
npm ci
npm run lint
npm run build
```

The build output is expected in `dist/`. The build must not require reusable GoreeCloud credentials in source code.

The repository includes `.github/workflows/ci.yml` to run the same lint/build baseline on supported GitHub Actions events when Actions are enabled.

## Firefox development validation

Load the generated `dist/` directory as a temporary/unpacked extension using Firefox's development-extension workflow, then validate the following against an approved private GoreeCloud Bookmarks test instance built with the companion scoped-session branch:

1. Extension name is **GoreeCloud Bookmarks**.
2. Popup and setup screens use GoreeCloud Bookmarks identity and Glaze UI treatment.
3. Settings begin with no upstream cloud service preconfigured.
4. Fresh installation does not receive blanket `<all_urls>` access.
5. Instance URL requires HTTPS.
6. Saving a connection requests access only to the configured GoreeCloud Bookmarks host.
7. Username/password authentication creates a dedicated named `browser_extension` session with a 30-day expiration.
8. The normal account password is not persisted in extension configuration.
9. API-key authentication remains available when explicitly selected.
10. The scoped browser session can read config, collections, and tags and perform duplicate search.
11. Current-page capture succeeds with the scoped browser session.
12. Collection selection and tag loading work.
13. Optional note/description behavior remains functional.
14. Duplicate detection behaves as expected after the user opens the extension.
15. The single page context-menu capture action succeeds.
16. Optional page-image capture succeeds.
17. Reconnecting with the same extension installation replaces the prior active named session rather than accumulating duplicate active sessions.
18. Disconnect clears local authentication state and cached bookmark metadata.
19. Disconnect self-revokes only the current extension-created session through `DELETE /api/v1/session`.
20. A revoked extension-created session can no longer access protected Bookmarks APIs.
21. A browser-extension session is denied access to `/api/v1/tokens` and unrelated protected APIs.
22. An expired browser-extension session requires an explicit reconnect; the normal account password is not stored for silent renewal.
23. Disconnect removes the configured optional host permission where supported.
24. A manually supplied API key is removed locally on disconnect and the interface explains that remote revocation must be completed in GoreeCloud Bookmarks when required.
25. Merely activating, updating, or browsing unrelated tabs does not transmit those page URLs to the Bookmarks server.
26. Popup settings and application links open the configured destination correctly.
27. Keyboard focus remains visible on actionable controls.
28. Light and dark appearances remain usable.

## Permission validation

Before a Firefox release, compare the built manifest against `SECURITY_PERMISSIONS.md` and confirm that the approved v0.1 permission set remains limited to:

- `storage`
- `scripting`
- `activeTab`
- `contextMenus`
- runtime optional HTTPS host access for the user-configured Bookmarks instance

The following inherited privileges are not approved for the current v0.1 security model and must not silently return:

- install-time `<all_urls>` access
- `tabs`
- `bookmarks`
- passive active-tab duplicate checks
- save-all-tabs behavior
- broad selection/link/image/audio/video context-menu capture

Any future feature that requires one of these privileges needs its own purpose, privacy review, implementation review, tests, and documentation before the permission is restored.

## Authentication and secret-handling validation

- Confirm no reusable credential is committed to Git.
- Confirm username and password values are not written to persistent extension settings.
- Confirm the bearer token is stored separately from ordinary configuration data.
- Treat local browser-profile token storage as sensitive; do not describe it as encrypted secret storage unless separately verified.
- Confirm the extension requests `purpose: browser_extension` only for username/password session exchange.
- Confirm the returned purpose-scoped token expires after 30 days.
- Confirm an extension-created named session appears in the Bookmarks token/session inventory.
- Confirm reconnecting with the same installation name revokes the prior active session server-side before the replacement is created.
- Confirm the scoped token is accepted only for the extension API allowlist documented in `SECURITY_PERMISSIONS.md`.
- Confirm `/api/v1/tokens`, token-by-ID deletion, unrelated user/account APIs, and unapproved collection mutations are denied to the scoped token.
- Confirm disconnect uses bearer self-revocation rather than account-wide token enumeration.
- Confirm remote revocation prevents later API use.
- Confirm manually supplied API keys are clearly identified as requiring server-side revocation when remote invalidation is desired.

The companion server branch includes focused authorization regression tests and the GoreeCloud Bookmarks CI workflow runs Vitest before the production web build. Both the server and extension exact heads must have green automated checks before manual acceptance is considered valid.

## Identity and packaging validation

Before a GoreeCloud release:

- Replace the remaining upstream raster toolbar/extension-management icons (`16.png`, `32.png`, `48.png`, `128.png`) with approved GoreeCloud assets.
- Confirm visible context-menu, popup, options, and omnibox text uses GoreeCloud Bookmarks naming.
- Preserve required MIT license and upstream provenance notices.
- Do not change Firefox signing identity, browser-store identifiers, update metadata, or Safari bundle identifiers without a documented packaging/signing decision.
- Confirm the Firefox minimum-version decision remains compatible with the runtime optional-host-permission model.

## Safari boundary

Safari conversion, Xcode project naming, bundle identifiers, signing, permission behavior, and Safari-specific raster assets remain a separate validation track. A successful Firefox/Chromium build is not evidence that a Safari package is ready for distribution.

## Release gate

Do not merge or distribute the Firefox extension until the paired server and extension automated checks, installation, explicit host-permission behavior, scoped authentication, capture, self-revocation, authorization-denial, expiration/reconnect, no-passive-browsing-transmission, and relevant identity/security checks have all been recorded as successful. A draft pull request is not release approval.
