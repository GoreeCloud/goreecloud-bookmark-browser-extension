# GoreeCloud Bookmarks Browser Extension Validation Baseline

This document defines the minimum validation expected before GoreeCloud browser-extension branches can be merged or distributed.

## Current scope

- Repository: `GoreeCloud/goreecloud-bookmark-browser-extension`
- Upstream basis: `linkwarden/browser-extension` v1.5.4
- Baseline commit: `3175f85191bab62d84873c46e54b32ab958f9be8`
- Identity branch: `feature/goreecloud-identity`
- Glaze UI branch: `feature/goreecloud-glaze-ui`
- Firefox security branch: `security/firefox-permission-model`

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
2. Popup and setup screens use GoreeCloud Bookmarks identity and Glaze UI treatment.
3. Settings begin with no upstream cloud service preconfigured.
4. Fresh installation does not receive blanket `<all_urls>` access.
5. Instance URL requires HTTPS.
6. Saving a connection requests access only to the configured GoreeCloud Bookmarks host.
7. Username/password authentication creates a dedicated named browser session.
8. The normal account password is not persisted in extension configuration.
9. API-key authentication remains available when explicitly selected.
10. Current-page capture succeeds.
11. Collection selection and tag loading work.
12. Optional note/description behavior remains functional.
13. Duplicate detection behaves as expected after the user opens the extension.
14. The single page context-menu capture action succeeds.
15. Optional page-image capture succeeds.
16. Disconnect clears local authentication state and cached bookmark metadata.
17. Disconnect attempts to revoke an extension-created named browser session remotely.
18. A revoked extension-created session can no longer access protected Bookmarks APIs.
19. Disconnect removes the configured optional host permission where supported.
20. A manually supplied API key is removed locally on disconnect and the interface explains that remote revocation must be completed in GoreeCloud Bookmarks when required.
21. Merely activating, updating, or browsing unrelated tabs does not transmit those page URLs to the Bookmarks server.
22. Popup settings and application links open the configured destination correctly.
23. Keyboard focus remains visible on actionable controls.
24. Light and dark appearances remain usable.

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
- Confirm an extension-created named session appears in the Bookmarks token/session inventory.
- Confirm remote revocation of that named session prevents later API use.
- Confirm reconnect cleanup does not leave unnecessary older sessions for the same extension installation.
- Confirm manually supplied API keys are clearly identified as requiring server-side revocation when remote invalidation is desired.

The current server-side session token remains revocable but is not yet a purpose-scoped, short-lived browser-extension token. That server-side limitation must remain documented until a dedicated token design is implemented or explicitly accepted for the MVP.

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

Do not merge or distribute the Firefox extension until lint, build, installation, explicit host-permission behavior, authentication, capture, disconnect, credential revocation, no-passive-browsing-transmission checks, and the relevant identity/security checks have been recorded as successful. A draft pull request is not release approval.
