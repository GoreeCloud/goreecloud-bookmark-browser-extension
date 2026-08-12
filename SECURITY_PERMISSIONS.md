# GoreeCloud Bookmarks Firefox Security and Permission Model

This record defines the approved Firefox WebExtensions permission and authentication model for the GoreeCloud Bookmarks browser companion. It applies to the security branch stacked above the validated Glaze UI work and is intended to make every browser privilege reviewable before distribution.

## Governing security principles

The extension follows these GoreeCloud requirements:

- Request only the browser privileges required for user-initiated bookmark actions.
- Do not collect or transmit browsing history unrelated to an explicit approved action.
- Use HTTPS for communication with the configured GoreeCloud Bookmarks instance.
- Treat bearer tokens and API keys as sensitive authentication material.
- Do not persist a user's normal application password.
- Prefer independently revocable browser credentials over reusable account passwords.
- Remove access when its purpose ends.
- Document every requested permission and its operational purpose.

## Required manifest permissions

### `storage`

Purpose:

- Store non-secret extension preferences such as the configured instance URL and default collection.
- Store a stable local client identifier used only to name the browser session created for this extension installation.
- Store the active bearer token or manually supplied API key in a separate extension-local storage entry rather than embedding it in the ordinary configuration record.
- Store local bookmark metadata used by the inherited omnibox cache.

Security boundary:

- Username and password values are not persisted.
- Authentication material must never be written to source code, repository documentation, logs, screenshots, issue bodies, or pull-request descriptions.
- Disconnect removes the local token value.
- The token is still sensitive even though it is stored in extension-local browser storage. This branch does not claim that browser storage provides secret-manager-grade encryption.

### `activeTab`

Purpose:

- Read the URL and title of the current page when the user invokes the browser action or another approved current-page action.
- Provide temporary page access needed for an explicitly requested page-image capture.

Security boundary:

- The extension no longer performs passive active-tab duplicate checks on tab activation, page update, or browser startup.
- Current-page URLs are sent to GoreeCloud Bookmarks only as part of an explicit popup, save, duplicate-check, context-menu, or capture workflow.

### `scripting`

Purpose:

- Support the existing full-page screenshot implementation when the user explicitly enables page-image capture.
- Temporarily inspect viewport dimensions, scroll position, and page layout and temporarily adjust fixed/sticky elements while assembling a full-page screenshot.

Security boundary:

- Script execution is tied to the user-initiated capture workflow.
- The extension does not install a persistent content script for ordinary browsing.

### `contextMenus`

Purpose:

- Provide one explicit **Save page to GoreeCloud Bookmarks** action for the current page.

Security boundary:

- Inherited selection, link, image, editable, video, audio, and save-all-tabs menu entries are removed from the v0.1 permission model because those workflows are not required by the current MVP and their former handler did not preserve context-specific semantics.

## Optional configured-instance host access

Manifest declaration:

- `optional_host_permissions`: `https://*/*`

This declaration is a capability to ask for a host later; it is not an install-time grant to every HTTPS website.

Operational model:

1. The user enters an HTTPS GoreeCloud Bookmarks instance in the extension settings.
2. The user chooses **Save connection**.
3. In that user-initiated action, the extension requests access only to the configured HTTPS hostname.
4. The extension stores the approved instance URL only after authentication succeeds.
5. When the configured host changes, the extension attempts to remove the old host grant.
6. Disconnect attempts to remove the current host grant.

The manifest no longer contains `<all_urls>` or a permanent broad host permission.

## Permissions removed from the inherited extension

### `<all_urls>` host access — removed

Reason:

The MVP does not require permanent access to every website. Current-page access is user initiated and can use `activeTab`; the private Bookmarks server can be authorized separately at runtime.

### `tabs` — removed

Reason:

The inherited background worker used tab activation/update/startup listeners to run duplicate checks against the Bookmarks server, which caused active-page URLs to be evaluated without an explicit bookmark action. Those passive listeners are removed. The inherited save-all-tabs feature is also removed from v0.1. Current-page access remains available through an explicit active-tab workflow.

### `bookmarks` — removed

Reason:

The inherited browser-bookmark synchronization listeners are inactive/commented and the GoreeCloud v0.1 extension does not expose browser-bookmark synchronization as an approved workflow. Reintroducing synchronization requires a separate design, privacy, and permission review.

## Passive browsing-data transmission removed

Before this security pass, the background worker called duplicate detection when:

- a tab became active;
- a tab updated;
- the browser/extension startup path queried the active tab.

Duplicate detection includes the active page URL in a GoreeCloud Bookmarks search request. That behavior is incompatible with GoreeCloud's requirement not to process unrelated browsing history outside approved user actions.

The background worker now avoids passive tab-change listeners. Duplicate checking remains in the popup because opening the browser action is an explicit user action. The context-menu save action is also explicit.

## Authentication lifecycle

### Username/password connection

1. Firefox requests permission for the configured HTTPS Bookmarks host during **Save connection**.
2. The username and password are sent directly to the configured Bookmarks session endpoint.
3. The server returns a bearer token associated with a named browser session.
4. The password is not persisted by the extension.
5. The returned bearer token is stored in the extension's separated authentication storage entry.
6. Reconnecting with the same browser installation attempts to revoke older duplicate named sessions after the new session is established.
7. Disconnect attempts to revoke the named session through the existing Bookmarks token API before clearing local authentication state.

The stable client identifier is not an authentication secret. It exists only to distinguish this extension installation's server-side session name.

### Manual API-key connection

A user may still provide an existing API key for compatibility.

- The key is treated as sensitive authentication material.
- Disconnect clears the local copy and removes the configured host permission.
- The extension cannot reliably identify the server-side token record that corresponds to an arbitrary pasted key because the existing token-list API does not expose the token identifier carried inside the bearer value.
- Therefore the user must revoke a manually supplied API key from GoreeCloud Bookmarks when remote invalidation is required.

## Server-side token limitation that remains

The inherited Bookmarks session endpoint creates a revocable access-token record, and the server rejects a bearer token after that record is revoked. This satisfies the basic revocation requirement for extension-created sessions.

However, the current server-generated session token is not a dedicated limited-purpose browser-extension scope and is configured with an extremely long expiration. This branch does not represent that as a completed least-privilege token design.

Required follow-up server work:

- define a browser-extension token/session type with only the API capabilities required by approved extension features;
- use a materially shorter and reviewable lifetime;
- preserve independent per-device or per-extension-installation revocation;
- make renewal/expiration behavior explicit;
- keep ordinary application passwords out of extension storage;
- add authorization regression tests for extension-token scope.

## Content Security Policy

Extension-page network access is restricted to:

- the extension itself; and
- HTTPS destinations.

Plain HTTP connections are not part of the approved GoreeCloud Bookmarks extension model.

## Firefox compatibility boundary

The Firefox minimum version is raised to 128 for this security model because the runtime optional-host-permission design is treated as a required capability of the approved MV3 configuration.

The existing Firefox signing identity is intentionally unchanged in this branch. Signing-ID replacement remains a separate packaging and distribution decision.

## Manual Firefox security acceptance

Before distribution, validate all of the following in Firefox against an approved non-production or production-representative Bookmarks instance:

1. Fresh installation does not request blanket all-sites access.
2. The extension is not configured until a Bookmarks server is explicitly approved.
3. Non-HTTPS instance URLs are rejected.
4. Saving a connection requests only the configured Bookmarks HTTPS host.
5. Username/password login succeeds and the password is not present in extension-local persisted configuration.
6. The extension-created browser session is visible in the Bookmarks token/session inventory with its unique GoreeCloud browser-session name.
7. Reconnecting does not accumulate unnecessary older sessions with the same installation name.
8. Disconnect revokes an extension-created session on the server and clears the local token.
9. A revoked extension-created session can no longer call protected Bookmarks APIs.
10. Manual API-key disconnect clears the local key and clearly requires server-side revocation when remote invalidation is desired.
11. The configured optional host permission is removed on disconnect.
12. Opening unrelated websites without invoking the extension does not send their URLs to the Bookmarks server.
13. Opening the popup performs duplicate detection only as part of that explicit action.
14. Current-page save succeeds.
15. Collection, tags, and note capture continue to work.
16. The single page context-menu save action succeeds.
17. Page-image capture succeeds only after the user enables it.
18. Full-page capture cleanup restores temporary page-style changes after success or failure.
19. Light/dark and keyboard-accessibility behavior remains intact.
20. Lint and production build both pass on the exact reviewed commit.

## Release gate

This security branch does not approve merge, Firefox signing, browser-store submission, or production deployment. Distribution remains blocked until the manual Firefox security acceptance above is completed and the remaining server-side scoped-token decision is explicitly resolved or accepted for the MVP.
