# GoreeCloud Bookmark Browser Extension Fork Record

## Product identity

- **Product:** GoreeCloud Bookmarks Browser Extension
- **Repository:** `GoreeCloud/goreecloud-bookmark-browser-extension`
- **Companion application:** `GoreeCloud/goreecloud-bookmarks`
- **Development model:** Maintained open-source fork of the Linkwarden browser extension
- **Status:** Development and validation only; distribution and production use are not yet approved

## Upstream provenance

- **Upstream repository:** `linkwarden/browser-extension`
- **Initial GoreeCloud fork base:** v1.5.4
- **Initial upstream commit:** `3175f85191bab62d84873c46e54b32ab958f9be8`
- **License:** MIT, preserved from upstream

Required upstream copyright and license notices must remain intact as GoreeCloud branding and functionality are introduced.

## Intended role

The extension is a first-class component of GoreeCloud Bookmarks. Its initial purpose is to provide fast, user-initiated capture from Firefox into a private GoreeCloud Bookmarks account. Planned GoreeCloud functionality includes current-page capture, collection selection, tags, optional notes, duplicate awareness where practical, and opening the GoreeCloud Bookmarks application.

## Security and privacy boundary

- Use the narrowest practical browser permissions for approved features.
- Do not embed reusable GoreeCloud credentials in source code.
- Prefer revocable, per-user, limited-purpose authentication for extension access when the application supports it.
- Do not collect browsing history unrelated to explicit user actions.
- Do not send page content to advertising, analytics, telemetry, or external AI services as a requirement of normal operation.
- All communication with an approved GoreeCloud deployment must use HTTPS.

## Packaging boundary

The initial upstream manifest contains browser-specific identity and distribution metadata. GoreeCloud will not change Firefox signing IDs, browser store identifiers, update URLs, or equivalent packaging identifiers until a deliberate packaging and signing decision has been made and tested.

User-visible product naming may be changed independently from those identifiers during development.

## Branch and maintenance policy

- `main` remains the accepted repository state.
- GoreeCloud identity work begins on `feature/goreecloud-identity`.
- Upstream ancestry must remain traceable.
- Compatible upstream fixes, particularly security fixes, should continue to be reviewed.
- GoreeCloud-specific changes should remain isolated and documented where practical.

## Current implementation boundary

This record does not claim that a GoreeCloud extension package has been signed, published, or validated in Firefox. Build, lint, installation, authentication, capture, logout, and token-revocation testing remain required before an extension release is approved.
