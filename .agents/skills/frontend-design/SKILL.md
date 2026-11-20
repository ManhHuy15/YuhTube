---
name: frontend-design
description: >-
  Create distinctive, production-grade frontend interfaces with high design craft.
  Use when building, refactoring, or polishing web components, pages, design systems,
  or UI layouts to prevent generic "AI slop" and establish bold, intentional aesthetics.
---

# Frontend Design Craft Skill

## Philosophy & Core Principles

Generic AI frontends all look the same: bland purple-on-white gradients, cookie-cutter 3-column card grids, identical pill buttons, and indifferent typography. This skill commands you to act like a **lead design technologist at a world-class digital product studio**.

Every screen, component, and interaction must feel **intentional, opinionated, and tailored specifically to the product's domain**.

---

## 1. The Design Read & Studio Mindset

Before writing UI code, formulate an explicit **Design Read**:
- **Subject & Context**: What is the application? (e.g. YuhTube: A modern high-performance video streaming platform built for creators and viewers).
- **Aesthetic Archetype**: Choose a deliberate visual archetype rather than defaulting to generic SaaS:
  - *Cinematic Dark Mode*: Deep obsidian backgrounds (`#0e0e10`, `#131315`), glassmorphism with subtle borders (`white/10`), vibrant primary brand red with sharp contrast.
  - *Studio Control Precision*: Crisp micro-indicators, mono-spaced metrics for timecodes/bitrate/resolutions, tight information hierarchy.
- **Anti-Generic Screen**: Never settle for:
  - ❌ Generic purple/indigo gradients.
  - ❌ Overly floaty or uniform drop-shadows with fuzzy edges.
  - ❌ Centered text blocks with emoji icons as bullet points.
  - ❌ Unresponsive, rigid pixel widths.

---

## 2. Token System & Design Palette

Always operate with a disciplined design token structure:

1. **Color Roles**:
   - **Base Canvas**: Deep, warm obsidian black (`#0f0f11`, `#131315`), not washed-out grey.
   - **Surface & Cards**: `#1c1b1d`, `#201f21` with high-clarity 1px borders (`border-white/10` or `border-white/15`).
   - **Primary Action**: Crisp brand red (`#FF0000`, `#e50914`, `red-600`) with hover depth and active press scale.
   - **Accents**: Neon Cyan / Aqua (`#69d8d4`) for technical feedback (progress, HDR, resolution chips, time remaining).
   - **States**: Emerald (`emerald-400`/`emerald-500`) for cloud sync and completed states; Amber/Gold for uploading and warnings; Crimson for errors.

2. **Typography Hierarchy**:
   - **Headings**: Tight tracking (`tracking-tight`), strong visual weight, truncation handling.
   - **Body**: High legibility, neutral tone with controlled contrast (`text-[#e5e1e4]`, `text-[#c6c6cb]`, `text-white/60`).
   - **Meta & Technical Details**: Font Mono (`font-mono`) for timecodes, bitrates, file sizes, resolutions (`1080p`, `4K`, `60 FPS`).

---

## 3. Layout Architecture & Spatial Density

- **Rhythm & Structure**: Use asymmetrical focal points, split layouts (e.g., media preview on right, workstation controls on left), and floating action trays.
- **Micro-Interactions**:
  - Buttons must provide tactile feedback: hover color transitions, focus-visible outlines, `active:scale-95` press states.
  - Loaders must use custom animated spinners or smooth pulse animations, never jarring shifts.
  - Backdrop filters (`backdrop-blur-xl`, `bg-black/80`) for floating layers and quality menus.

---

## 4. Production Finish Gate

Before completing any UI component:
- [ ] Are all text elements paired with appropriate line-heights and truncation rules?
- [ ] Is there clear visual feedback for every state: default, hover, active, focus, loading, disabled, error?
- [ ] Is contrast compliant with WCAG AA standards against dark surfaces?
- [ ] Does it look like a custom hand-crafted design, free of "AI template" clichés?
