---
name: Design system document created
description: design-system.md created at docs/product/design-system.md; documents Tailwind tokens, 11 components, CSS classes, and prohibited patterns
type: project
---

`docs/product/design-system.md` was created 2026-05-02 as the technical implementation reference for the ALTEKO UI.

Key decisions recorded:
- shadcn/ui rejected (12 components don't justify 40+ Radix files + ~50KB bundle)
- System font stack only (no custom font)
- No dark mode
- Tailwind CSS v3, all tokens in tailwind.config.ts
- 11 components in src/components/ui/, all ≤100 lines, no third-party deps
- status-dot-* CSS classes replace emoji 🔴🟡🟢 in component code (emoji notation still used in design.md wireframes — intentional distinction)

**Why:** First design-system doc; all decisions were finalized before writing.

**How to apply:** When documenting new UI components or tokens, follow the table-per-section structure used here. Always clarify that wireframe emoji notation in design.md differs from implementation (no emoji in code).
