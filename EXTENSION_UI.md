# GoreeCloud Bookmarks Extension UI Foundation

This document records the Glaze UI foundation for the GoreeCloud Bookmarks browser extension. The work is intentionally stacked on `feature/goreecloud-identity` so product identity and extension-interface changes remain independently reviewable.

## Design basis

The extension follows the GoreeCloud Bookmarks project specification and the Glaze UI design language.

The browser companion should remain focused on fast capture rather than reproduce the full Bookmarks web application. The primary experience is:

1. Open the browser action.
2. Confirm or choose the destination collection.
3. Optionally add tags, title adjustments, a note/description, or a browser capture.
4. Save the current page.
5. Receive clear success, duplicate, loading, or failure feedback.

## Glaze UI implementation

The visual-alignment pass introduces:

- Layered card surfaces with restrained translucency and softened depth.
- A GoreeCloud Bookmarks header that uses the existing original extension asset.
- A clearer primary hierarchy around the `Save this page` workflow.
- Shared semantic light/dark design tokens based on the Bookmarks icon palette.
- Rounded controls and consistent spacing across popup and options surfaces.
- Visible keyboard focus rings in shared button, input, textarea, and select primitives.
- Reduced-motion handling through `prefers-reduced-motion`.
- A Glaze UI onboarding state for an extension that has not yet been configured.
- A structured connection/settings page with explicit instance and authentication sections.
- A redesigned collection picker that preserves the existing collection-selection behavior while using theme-aware surfaces and keyboard-visible controls.
- A clearer optional-details section for tags, title, and the bookmark note/description field.
- A touch-friendly page-image capture control.
- A dedicated duplicate-bookmark notice that opens the existing bookmark search result.
- A Glaze UI capture/upload progress overlay with polite live-region status.
- Clear wording that extension settings do not publish or deploy a production service.

## Preserved behavior

This visual pass does not intentionally change:

- Current-page detection.
- Bookmark creation requests.
- Collection loading or selection semantics.
- Tag loading, searching, or selection semantics.
- Duplicate-link detection or its existing search destination.
- Optional browser image capture behavior.
- Username/password session exchange behavior.
- API-key authentication behavior.
- Extension-local configuration storage behavior.
- Badge updates.
- Context-menu behavior.
- Firefox permissions or host permissions.
- Firefox signing identity.
- Server API endpoints.

## Security boundary

The GoreeCloud Bookmarks project specification requires the narrowest practical WebExtensions permissions and prefers revocable, limited-purpose per-user tokens over normal account passwords when the server supports them. This visual pass does not claim that the authentication architecture is finished.

Before distribution, the extension still requires a dedicated security review covering:

- Requested permissions and why each is required.
- Whether `<all_urls>` can be reduced without breaking approved capture workflows.
- Revocable-token behavior against the GoreeCloud Bookmarks server.
- Logout/disconnect and token revocation.
- Browser-storage handling of authentication material.
- Duplicate handling and user feedback.
- Firefox installation and signing identity.

## Validation requirements

Every code-bearing head of this branch should pass the repository's TypeScript build and ESLint validation before review. Manual Firefox acceptance is also required for popup sizing, keyboard navigation, light/dark appearance, collection selection, tags, notes, duplicate feedback, setup, save, disconnect, and error states.

No production deployment or Firefox distribution is approved by this branch.
