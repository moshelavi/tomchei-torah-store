---
name: Sartorial Academic
colors:
  surface: '#faf9f7'
  surface-dim: '#dadad8'
  surface-bright: '#faf9f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f1'
  surface-container: '#efeeec'
  surface-container-high: '#e9e8e6'
  surface-container-highest: '#e3e2e0'
  on-surface: '#1a1c1b'
  on-surface-variant: '#46464b'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f1ef'
  outline: '#76777b'
  outline-variant: '#c7c6cb'
  surface-tint: '#5e5e62'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1f'
  on-primary-container: '#848387'
  inverse-primary: '#c7c6ca'
  secondary: '#5c5e65'
  on-secondary: '#ffffff'
  secondary-container: '#e1e2ea'
  on-secondary-container: '#62646b'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#281800'
  on-tertiary-container: '#9a805b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e3e2e6'
  primary-fixed-dim: '#c7c6ca'
  on-primary-fixed: '#1b1b1f'
  on-primary-fixed-variant: '#46464a'
  secondary-fixed: '#e1e2ea'
  secondary-fixed-dim: '#c5c6ce'
  on-secondary-fixed: '#191c21'
  on-secondary-fixed-variant: '#44474d'
  tertiary-fixed: '#fedeb2'
  tertiary-fixed-dim: '#e0c298'
  on-tertiary-fixed: '#281800'
  on-tertiary-fixed-variant: '#584323'
  background: '#faf9f7'
  on-background: '#1a1c1b'
  surface-variant: '#e3e2e0'
typography:
  display-hero:
    fontFamily: Rubik
    fontSize: 56px
    fontWeight: '900'
    lineHeight: 64px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Rubik
    fontSize: 36px
    fontWeight: '900'
    lineHeight: 42px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Rubik
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Rubik
    fontSize: 26px
    fontWeight: '800'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Rubik
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Rubik
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Rubik
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: 0em
  body-md:
    fontFamily: Rubik
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Rubik
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.14em
  label-price:
    fontFamily: Space Grotesk
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 3rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 2rem
  space-xl: 4rem
---

## Brand & Style

This design system establishes a high-fashion, minimalist luxury aesthetic curated strictly for the contemporary Yeshiva scholar. It bridges rigorous traditional sartorial standards (crisp non-iron whites, bespoke wool tailoring, velvet and silk accessories, functional dorm essentials) with the stark, avant-garde editorial posture of European fashion houses like Zara and Next.

### Brand Personality & Mood
- **Sartorial Discipline:** Impeccably structured, refined, and immaculate.
- **Intellectual & Unhurried:** Respects the contemplative rhythm of traditional study while delivering modern retail efficiency.
- **Sharp Modernism:** High contrast, deliberate architectural framing, razor-sharp alignment, and spacious breathing room.

### Design Direction
- **Style Archetype:** Modern Editorial Minimalism combined with High-Contrast Monolith structures.
- **RTL-Native Discipline:** Grounded in a right-to-left layout direction, ensuring natural typographic flow, optical balance, and inverted gestural logic.
- **Visual Tenor:** Surfaces rely primarily on pure optical white spaces framed against profound matte charcoal and deep obsidian, punctuated by warm oat/parchment undertones.

## Colors

The palette is rooted in classical tailoring textures: the deep matte wool of suits, the optic purity of crisp cotton poplin, and the warm parchment tone of archival texts.

### Functional Roles
- **Primary (`#111215`):** Deep Obsidian / Matte Black. Used for solid CTA buttons, high-impact Hebrew headlines, and primary structural borders. Never absolute `#000000`, maintaining textile depth.
- **Secondary (`#73757C`):** Tailor's Charcoal. Applied to secondary labels, garment specifications (e.g., thread count, weave), breadcrumbs, and inactive pagination markers.
- **Tertiary (`#C5A880`):** Warm Sand / Talith Gold. Reserved for subtle editorial accents, seasonal curation tags, luxury tier badges (e.g., Super 150s Wool, Hand-Spun Tzitzit), and fine focus indicators.
- **Neutral Surface (`#F9F8F6`):** Warm Alabaster / Crisp White. Serves as the canvas backdrop, card container background, and off-white negative space, preventing sterile eye fatigue.

### Surface Tiers & Dynamic Application
- **Canvas Base:** `#FFFFFF` to `#F9F8F6` provides a light-reflecting, clean baseline.
- **Muted Surfaces:** `#F0EDE7` for subtle product tile backgrounds, drawer sidebars, and filtering drawers.
- **Hairlines & Dividers:** High-transparency charcoal (`rgba(17, 18, 21, 0.08)`) to preserve clean lines without heavy visual breaks.

## Typography

The typographic hierarchy prioritizes architectural strength and rapid readability. In Hebrew, weight replaces traditional Latin serif italics to convey authority and high luxury.

### Font System & Role Assignment
- **Primary & Display Typeface (Rubik):** Selected for its geometric density, modern proportions, and commanding impact in weights `700`, `800`, and `900`. Display headings in Hebrew mimic the bold, squared presence of high-end editorial broadsheets.
- **Technical & Utility Typeface (Space Grotesk):** Applied exclusively for numeric indicators, currency values (₪ / $), sizing matrix codes (e.g., 38R, 40L), and uppercase category tags.

### Typographic Execution
- **Tracking & Proportion:** Display headlines feature slight negative tracking for a compact, solid posture. Technical uppercase tags feature wide letter spacing (`0.14em`) to contrast with the dense Hebrew glyphs.
- **RTL Flow:** Punctuation, currency markers, and numerals sit aligned to Hebrew editorial standards without bi-directional distortion.

## Layout & Spacing

Layouts follow a structured, multi-tier fluid grid inspired by European high-fashion editorial layouts. White space is generous, treating the digital screen as an art publication page.

### Grid & Layout Structure
- **Desktop (12 Columns):** Content conforms to a fluid 12-column layout with `3rem` (48px) exterior margins and `1.5rem` (24px) gutters. Product grids typically span 3 columns (4 items per row) or 4 columns (3 expansive editorial items per row).
- **Tablet (8 Columns):** Standardized to 8 columns with `2rem` margins and `1rem` gutters.
- **Mobile (4 Columns):** Strict 4-column layout with `1rem` margins and `0.75rem` gutters. Product cards default to 2 columns with dynamic aspect ratio preservation.

### Spacing Scale & Rhythm
- **Micro Rhythms (`space-xs` to `space-sm`):** 4px to 8px gap between badge labels, color selection swatches, and inline pricing.
- **Component Breathing Space (`space-md` to `space-lg`):** 16px to 32px padding within modals, drawer panels, and product detail summary blocks.
- **Editorial Breaths (`space-xl`):** 64px structural offsets between lookbook groupings, category chapters, and story sections.

## Elevation & Depth

This design system avoids blurry drop shadows, maintaining an authentic, tactile paper and fabric aesthetic. Depth is achieved entirely through overlapping planes, tonal surface shifts, and razor-sharp hairline borders.

### Surface Stratification
- **Ground Floor (Base Canvas):** Light `#F9F8F6` or pure `#FFFFFF` background.
- **Level 1 (Card Tiles & Shelves):** Pure `#FFFFFF` surfaces set against slightly tinted container bounds or separated by `1px` lines (`rgba(17, 18, 21, 0.08)`).
- **Level 2 (Drawers & Sticky Navigation):** High-opacity frosted backdrops (`rgba(249, 248, 246, 0.92)` with `16px` backdrop-blur) to anchor navigation bars and quick-filter trays during scrolling.
- **Level 3 (Modals & Overlays):** Deep obsidian scrim with high transparency (`rgba(17, 18, 21, 0.45)`), paired with a solid `#FFFFFF` modal frame bordered by a single hairline outline.

## Shapes

In alignment with sharp tailoring and formal suiting, the shape language is completely **Sharp (`0`)**.

### Structural Principles
- **0px Corner Radii:** Buttons, input fields, image wrappers, flyouts, and badges utilize perfectly square corners. This reflects the crisp creasing of non-iron garments, lapels, and book corners.
- **Edge Architecture:** Visual separation relies on precise lines, box models, and structural grids rather than pill shapes or soft bubbles.
- **Aspect Ratios:** Imagery adheres strictly to standard high-fashion proportions: `3:4` for portrait product catalog shots and `16:9` or `1:1` for dorm and luggage collections.

## Components

### 1. Buttons
- **Primary Action:** Solid `#111215` fill, `#FFFFFF` text, `0px` radius, `Space Grotesk` / `Rubik` Bold. Hover transitions smoothly to inverted state: `#FFFFFF` fill with a `1px` solid `#111215` inset border and `#111215` text.
- **Secondary (Editorial Outline):** Transparent background, `1px` solid `#111215` perimeter, `#111215` text. Hover fills to `#111215` with `#FFFFFF` text.
- **Text Action:** Underlined textual link with a `1px` baseline offset, animating from right-to-left on hover.

### 2. Product Cards
- **Structure:** Frameless image tile with a `3:4` vertical aspect ratio.
- **Micro-Interactions:** Subtle scale zoom (`1.02x`) of the garment image over 400ms on hover. A quick-add drawer slides upward from the bottom right edge.
- **Information Tier:** Product title in `Rubik` Medium, Hebrew sub-descriptor (e.g., "גזרה צרה | 100% כותנה מצרית"), followed by price in `Space Grotesk`.

### 3. Chips & Filters
- **Form:** Sharp rectangular boxes with `1px` border (`rgba(17, 18, 21, 0.15)`).
- **Selected State:** Solid `#111215` background with white typography.
- **RTL Multi-Select:** Dismiss cross icon positioned strictly on the left of Hebrew labels.

### 4. Input Fields & Selectors
- **Visual Style:** Minimalist bottom-border-only or fully enclosed sharp-bordered box (`1px` `#111215` when active, `rgba(17, 18, 21, 0.2)` when idle).
- **RTL Alignment:** Labels and placeholder text right-aligned; size matrices and stock indicators right-justified with numeric tags left-justified.

### 5. Checkboxes & Radio Elements
- **Style:** Square checkboxes and diamonds/squares for radio toggles, with sharp corners.
- **Active State:** Solid black fill with sharp white glyphs.

### 6. Specialized Catalog Modules
- **Tzitzit & Fabric Customizer:** Horizontal split-step selector with clear visualization of wool string thicknesses (דק / עבה), corner reinforcement fabrics, and tie patterns (רמב״ם / אשכנז / ספרד).
- **Bundle & Dorm Pack Builder:** Multi-column summary rack displaying non-iron shirt bundles (e.g., "5 Shirts Weekday Set") with instant size sync across all items.