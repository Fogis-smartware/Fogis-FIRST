---
name: Kinetic Precision
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#5a4136'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#8e7164'
  outline-variant: '#e3bfb1'
  surface-tint: '#a33e00'
  primary: '#a33e00'
  on-primary: '#ffffff'
  primary-container: '#ff6600'
  on-primary-container: '#561d00'
  inverse-primary: '#ffb596'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e4e2e1'
  on-secondary-container: '#656464'
  tertiary: '#0062a1'
  on-tertiary: '#ffffff'
  tertiary-container: '#009cfc'
  on-tertiary-container: '#003155'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcd'
  primary-fixed-dim: '#ffb596'
  on-primary-fixed: '#360f00'
  on-primary-fixed-variant: '#7c2e00'
  secondary-fixed: '#e4e2e1'
  secondary-fixed-dim: '#c8c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#474747'
  tertiary-fixed: '#d0e4ff'
  tertiary-fixed-dim: '#9ccaff'
  on-tertiary-fixed: '#001d35'
  on-tertiary-fixed-variant: '#00497b'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  section-gap: 120px
---

## Brand & Style

The design system is engineered for a high-performance smartware brand, blending industrial reliability with digital agility. The personality is **Professional, Modern, and Tech-forward**, aimed at an audience that values efficiency and cutting-edge hardware-software integration. 

The aesthetic follows a **Corporate Modern** style with **High-Contrast** accents. It utilizes generous whitespace to convey a sense of premium quality and "breathability," ensuring that complex technical information remains accessible. The UI evokes a feeling of precision and trust, using the vibrant orange as a "kinetic" signal color against a clean, architectural backdrop.

## Colors

The palette is anchored by **Vibrant Orange (#FF6600)**, used strategically for primary actions and brand emphasis to signify energy and innovation. 

- **Primary:** #FF6600. Reserved for key CTAs, active states, and brand highlights.
- **Secondary/Text:** #333333. Used for high-emphasis text and dark structural elements to provide a grounded, professional contrast.
- **Surface/Neutral:** #F5F5F5. Used for background sections, card fills, and secondary containers to maintain a clean, layered look.
- **Background:** #FFFFFF. The canvas for the entire experience, ensuring maximum legibility and a spacious feel.

For the bilingual interface, ensure the orange is never used for long-form Chinese text, as legibility is prioritized with the Secondary (#333333) tone.

## Typography

The design system utilizes **Inter** for its exceptional clarity and modern geometric construction, making it ideal for both English and Simplified Chinese characters (when paired with a high-quality system fallback like PingFang SC).

**Hierarchy Rules:**
- **Headlines:** Use tight letter-spacing and bold weights to create a "tech-heavy" editorial feel.
- **Body:** Prioritize line height (1.6) to ensure readability in long-form technical specifications or company news.
- **Bilingual Handling:** For Chinese text, increase the line-height slightly (+0.1) and avoid font weights below 400 to ensure stroke clarity on low-DPI displays.
- **Labels:** Use uppercase with tracking for technical data points and small navigation elements to differentiate from body prose.

## Layout & Spacing

This design system employs a **12-column fluid grid** for desktop and a **4-column grid** for mobile. The spacing philosophy is rooted in an 8px base unit to ensure mathematical harmony between components.

- **Desktop:** 12 columns with 24px gutters. Large 120px gaps between major sections to emphasize the "Spacious" brand requirement.
- **Mobile:** 4 columns with 16px gutters and 20px side margins. 
- **Alignment:** Content is centered in a max-width container of 1280px to maintain focus on ultra-wide monitors. 

Layouts should favor **asymmetric balance**; for example, a 7-column image paired with a 5-column text block to create dynamic visual interest.

## Elevation & Depth

To maintain a professional, tech-forward aesthetic, depth is communicated through **Tonal Layering** and **Ambient Shadows**.

- **Z-0 (Base):** White (#FFFFFF) background.
- **Z-1 (Low):** Neutral Gray (#F5F5F5) containers with no shadow, used for grouping content or table headers.
- **Z-2 (Raised):** Cards use a very soft, diffused shadow: `0px 4px 20px rgba(0, 0, 0, 0.05)`. This creates a subtle "lift" without looking heavy.
- **Z-3 (Overlay):** Navigation bars and modals use a tighter shadow with a subtle border: `0px 8px 32px rgba(0, 0, 0, 0.08)`. 

Avoid heavy dark shadows; instead, use 1px borders in #E5E5E5 for definition on white backgrounds.

## Shapes

The shape language is **Soft (Level 1)**. This choice reflects "Precision Engineering"—it is more approachable than sharp corners but feels more professional and industrial than pill-shaped consumer apps.

- **Components (Buttons/Inputs):** 0.25rem (4px) corner radius.
- **Cards:** 0.5rem (8px) corner radius to differentiate them as distinct content containers.
- **Feature Images:** Should maintain 0.5rem radius to align with the card language.

## Components

### Buttons
- **Primary:** Solid #FF6600 with white text. 4px radius. 16px horizontal padding.
- **Secondary:** Transparent with 1.5px border in #333333. 
- **States:** Hover state for Primary should be a slightly darker orange (#E65C00).

### Cards
- **Modern Product Card:** White background, Z-2 shadow, 8px radius. Features a "ghost" tag in the top-left for categories (e.g., "IoT", "AI").
- **Hover:** On hover, the card should translate -4px on the Y-axis and the shadow should deepen slightly.

### Input Fields
- Underlined or softly boxed (Neutral Gray #F5F5F5 fill). 
- Active state: 1.5px bottom border in Primary Orange.

### Chips & Tags
- Used for hardware specs. Small 12px Inter Bold text, light gray background (#F5F5F5), 2px radius.

### Navigation
- A "Sticky" top bar with a glassmorphism effect (backdrop-blur: 12px) and a subtle bottom divider. The language switcher (CN/EN) should be a clear, high-contrast toggle in the utility area.