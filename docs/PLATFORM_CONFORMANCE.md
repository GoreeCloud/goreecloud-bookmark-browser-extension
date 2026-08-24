# Mandatory Native and Platform Conformance

Effective August 24, 2026, this GoreeCloud application component must be built and maintained as original GoreeCloud-owned software from the ground up.

Small, technically necessary foundational dependencies remain permitted where independent reimplementation would reduce security, correctness, interoperability, standards compliance, or maintainability. Examples include cryptographic libraries, protocol libraries, browser APIs, and comparable critical foundations. Such dependencies must not become the application shell or define the GoreeCloud product identity.

The component must implement and remain current with the latest approved contracts for Glaze UI, Wardveil Security, GoreeCloud Privacy Shield, and Everkeep to the extent of the capabilities applicable to its role. Integration with all four platform systems is mandatory; role applicability determines the required capability surface, not whether the system is integrated.

No release state may be classified or retained as Stable unless native qualification and current validated conformance with all four platform systems are complete. A missing, materially incomplete, unvalidated, or materially outdated integration is a Stable blocker.

If this repository contains inherited or upstream-derived application code, that code is transitional or historical and is not the approved final architecture.

Repository CI, release documentation, project specifications, and change logs must progressively enforce and record this contract.