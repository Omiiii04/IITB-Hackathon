---
name: Arctic Marketplace
colors:
  surface: '#f9f9ff'
  surface-dim: '#d8d9e3'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3fd'
  surface-container: '#ecedf7'
  surface-container-high: '#e6e7f2'
  surface-container-highest: '#e1e2ec'
  on-surface: '#191b23'
  on-surface-variant: '#424754'
  inverse-surface: '#2e3038'
  inverse-on-surface: '#eff0fa'
  outline: '#727785'
  outline-variant: '#c2c6d6'
  surface-tint: '#005ac2'
  primary: '#0058be'
  on-primary: '#ffffff'
  primary-container: '#2170e4'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#924700'
  on-tertiary: '#ffffff'
  tertiary-container: '#b75b00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#f9f9ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ec'
  surface-alt: '#F8FAFC'
  text-main: '#0F172A'
  text-muted: '#475569'
  border-light: '#E2E8F0'
  admin-purple: '#8B5CF6'
typography:
  display-hero:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: '0'
  body-base:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: '0'
  micro-badge:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-max: 1280px
  gutter: 16px
---

## Brand & Style

This design system reimagines the platform through a lens of **Arctic Minimalism**, shifting from a dark, tech-heavy aesthetic to one that is airy, high-trust, and professional. The brand personality is "Clean-Industrial"—combining the precision of an enterprise tool with the approachability of a premium consumer marketplace. 

The visual signature is defined by:
- **Luminosity and Breathability:** Heavy use of white space and a pure white foundation to reduce cognitive load and emphasize content.
- **Glassmorphism (Light Variant):** Utilizing white-tinted glass and soft blurs to create subtle depth without the weight of traditional shadows.
- **High-Trust Contrast:** Using deep slates and navies for typography to ensure accessibility and a sense of institutional stability.
- **Technical Precision:** Retaining the sharp, technical details like hairline borders and monospaced data points to maintain the "marketplace engine" feel.

Targeting professional sellers and discerning shoppers, the UI evokes a sense of clarity, efficiency, and safety.

## Colors

The "Arctic" palette is optimized for clarity and high sunlight legibility, moving away from high-glare dark tones.

- **Primary (Vibrant Blue):** `#3B82F6`. The core engine for interaction, navigation highlights, and customer-facing calls to action.
- **Secondary (Merchant Green):** `#10B981`. Specifically for revenue, growth, and successful transaction states in the merchant hub.
- **Neutral (Slate & Navy):** The background is pure `#FFFFFF`. Low-tier surfaces (sidebars, secondary containers) use `#F8FAFC`. Typography uses `#0F172A` (Deep Slate) for headings and `#475569` for body text.

**Functional States:**
- **Success:** Emerald 600 (`#059669`) for positive feedback.
- **Warning:** Amber 500 (`#F59E0B`) for pending actions.
- **Danger:** Rose 600 (`#E11D48`) for errors and destructive actions.

## Typography

This design system uses **Inter** for all UI and brand copy, emphasizing its neutral, geometric qualities which excel in high-contrast light environments.

- **Hierarchy:** High-level headers use heavy weights (700-800) in Deep Slate to anchor the page against the white canvas.
- **Monospacing:** **JetBrains Mono** is essential for all financial and logistical data (SKUs, tracking numbers, prices) to ensure clear character differentiation and vertical alignment in tables.
- **Legibility:** Maintain generous line-heights (1.5x for body) to support the "airy" aesthetic. Letter-spacing should be slightly tighter for large display text and wider for micro-labels.

## Layout & Spacing

A **Fluid Grid** model is used to ensure the marketplace remains functional on everything from wide-screen merchant dashboards to mobile shopping apps.

- **Grid:** 12-column system on desktop with a 1280px max-width container. 
- **Reflow:** On mobile (<640px), the layout collapses to 1-2 columns with 16px safe-area margins.
- **Rhythm:** A 4px baseline grid governs all padding and margins. 
- **Density:** Use "Storefront Padding" (32px+) for product discovery and "Utility Padding" (8px-16px) for data-heavy merchant tables and sidebars.

## Elevation & Depth

In the light mode environment, hierarchy is achieved through **Tonal Layering** and **Soft Shadows**.

- **Surface 0 (Base):** `#FFFFFF`. The default background for all pages.
- **Surface 1 (Containers):** `#F8FAFC`. Used for sidebars, header backgrounds, or to group related content sections.
- **Surface 2 (Interactive):** Floating cards use a white background with a 1px border (`#E2E8F0`) and a very soft, diffused shadow (`y: 2, blur: 4, rgba(15, 23, 42, 0.05)`).
- **Glassmorphism:** Sticky headers and overlays use `rgba(255, 255, 255, 0.8)` with a `backdrop-blur-md` to allow color from product images to subtly bleed through.

## Shapes

The shape language is refined and approachable. 

- **Interactive Elements:** Buttons and inputs use a consistent 8px (0.5rem) radius.
- **Large Containers:** Product cards and dashboard modules use 16px (1rem) to create a distinct "pod" layout that feels modern.
- **Status Indicators:** Pill-shaped rounding is reserved for non-actionable status tags (e.g., "In Stock", "Shipped") to differentiate them from buttons.

## Components

### Buttons
- **Primary:** Rounded-lg (8px), solid Vibrant Blue background, white text. No gradients.
- **Secondary:** White background with a 1px Slate border and Navy text.
- **Interaction:** Hover states should shift the background color slightly darker (`Blue 600`) and apply a subtle lift shadow.

### Cards
- **Product Card:** White background, 1px `#E2E8F0` border, 16px corner radius. On hover, the border color shifts to Primary Blue.
- **Dashboard Card:** Flat, `#F8FAFC` background with no border, using typography and spacing to define hierarchy.

### Inputs & Forms
- **Text Fields:** White background, `#E2E8F0` border, 8px radius. 
- **Focus State:** 2px solid Primary Blue border with a soft blue outer glow.
- **Labels:** Semi-bold Deep Slate, positioned outside the field for maximum clarity.

### Data Tables
- **Styling:** Row-based dividers in `#F1F5F9`. Alternating zebra-striping is discouraged; use hover-state highlights in Primary Blue (5% opacity) instead.
- **Typography:** Headlines in Inter, data values in JetBrains Mono.

### Navigation
- **Storefront:** Pure white sticky header with a subtle bottom divider. 
- **Sidebar:** Light Gray (`#F8FAFC`) with deep slate icons (1.5px stroke weight). Active links use a Primary Blue vertical indicator on the left.