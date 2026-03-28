# IBM Carbon Design System Implementation

This document describes the implementation of IBM Carbon Design System across the EazyRentals application.

## Overview

The IBM Carbon Design System has been implemented across the entire application, providing a consistent, accessible, and enterprise-grade design language.

## Changes Made

### 1. Package Installation

```bash
npm install @carbon/react @carbon/styles @carbon/icons-react
```

### 2. Global Styles (`app/globals.css`)

- Imported IBM Plex Sans and IBM Plex Mono fonts (Carbon's typography)
- Added all Carbon CSS custom properties (tokens)
- Implemented Carbon's color system (background, layer, border, text, icons)
- Added Carbon spacing and layout scales
- Implemented Carbon motion (animations, transitions)
- Added Carbon focus styles for accessibility

### 3. Tailwind Configuration (`tailwind.config.js`)

Extended the Tailwind theme with Carbon Design System:

- **Colors**: Full Carbon color palette (blue, gray, red, green, yellow, orange, teal, purple, magenta, cyan)
- **Semantic Colors**: cds-* tokens for backgrounds, layers, borders, text, icons, buttons
- **Spacing**: Carbon spacing scale (01-13) and layout scale (01-07)
- **Typography**: IBM Plex Sans and IBM Plex Mono font families
- **Font Sizes**: Carbon heading and body text sizes
- **Border Radius**: Carbon uses 0px border radius (square corners)
- **Shadows**: Carbon elevation shadows
- **Z-Index**: Carbon z-index scale
- **Animations**: Carbon motion curves and durations

### 4. UI Components

All UI components have been updated to use Carbon Design System:

#### Button
- Variants: primary, secondary, tertiary, ghost, danger, danger-secondary
- Sizes: xs, sm, md, lg, xl
- Legacy variants mapped: outline → tertiary, success → primary
- Features: Loading state, icons, disabled state

#### Card
- Uses Carbon layer system (layer-01, layer-02, layer-03)
- Configurable padding (none, sm, md, lg)
- Optional border and hover effects

#### Input
- Carbon text field style with bottom border
- Sizes: sm, md, lg
- Features: Label, helper text, error state, icons
- Legacy size prop supported

#### Badge/Tag
- Types: gray, red, magenta, purple, blue, cyan, teal, green, cool-gray, warm-gray
- Legacy types mapped: default, secondary, outline, danger, warning, success, info
- Sizes: sm, md, lg
- FilterTag variant with remove button

#### StatusBadge
- Types: success, warning, error, info, neutral, in-progress, pending, completed, cancelled, active, inactive, vacant, occupied, owner_occupied, under_construction, archived, evicted, maintenance, paid, unpaid, partial, new, contacted, qualified, converted, lost
- Shows colored dot indicator
- Optional text label

#### Modal
- Sizes: xs (320px), sm (400px), md (544px), lg (768px), xl (960px)
- Features: Overlay, close button, footer actions
- Danger mode for destructive actions

#### Toast/Notification
- Types: success, error, warning, info
- Auto-dismiss after 5 seconds
- Uses `useToast` hook
- Legacy API supported: `showToast(title, message, type)`

#### ConfirmationDialog
- Props: title, message/description, confirmText/confirmLabel, cancelText/cancelLabel, isDanger/danger, variant
- Legacy props supported for backward compatibility

### 5. Layout (`app/layout.tsx`)

- Uses Next.js `next/font` for IBM Plex Sans and IBM Plex Mono
- Imports Carbon base styles
- Applies font-carbon class to body

### 6. Carbon Utilities (`lib/carbon/index.ts`)

Re-exports for convenient access:
- All Carbon icons from `@carbon/icons-react`
- Theme utilities from `@carbon/react`

## Carbon Design Tokens

### Colors
```css
--cds-background: #ffffff;
--cds-layer-01: #f4f4f4;
--cds-layer-02: #ffffff;
--cds-border-subtle-01: #c6c6c6;
--cds-border-strong-01: #8d8d8d;
--cds-border-interactive: #0f62fe;
--cds-text-primary: #161616;
--cds-text-secondary: #525252;
--cds-button-primary: #0f62fe;
--cds-button-secondary: #393939;
--cds-support-error: #da1e28;
--cds-support-success: #24a148;
--cds-support-warning: #f1c21b;
--cds-support-info: #0043ce;
```

### Spacing
```css
--cds-spacing-01: 0.125rem;   /* 2px */
--cds-spacing-02: 0.25rem;    /* 4px */
--cds-spacing-03: 0.5rem;     /* 8px */
--cds-spacing-04: 0.75rem;    /* 12px */
--cds-spacing-05: 1rem;       /* 16px */
--cds-spacing-06: 1.5rem;     /* 24px */
--cds-spacing-07: 2rem;       /* 32px */
--cds-spacing-08: 2.5rem;     /* 40px */
--cds-spacing-09: 3rem;       /* 48px */
--cds-spacing-10: 4rem;       /* 64px */
--cds-spacing-11: 5rem;       /* 80px */
--cds-spacing-12: 6rem;       /* 96px */
--cds-spacing-13: 10rem;      /* 160px */
```

### Typography
```css
--cds-font-family: 'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif;
--cds-font-family-mono: 'IBM Plex Mono', 'Menlo', 'DejaVu Sans Mono', monospace;
```

## Usage Examples

### Button
```tsx
import { Button } from '@/components/ui';

<Button variant="primary">Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="tertiary">Learn more</Button>
<Button variant="danger" isLoading={true}>Delete</Button>
<Button size="sm" leftIcon={<AddIcon />}>Add Item</Button>
```

### Card
```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui';

<Card layer="01" padding="md">
  <CardHeader title="Card Title" subtitle="Description" />
  <CardContent>Content here</CardContent>
  <CardFooter>Footer actions</CardFooter>
</Card>
```

### Input
```tsx
import { Input } from '@/components/ui';

<Input 
  label="Email" 
  placeholder="Enter email"
  helperText="We'll never share your email"
  leftIcon={<EmailIcon />}
/>

<Input 
  label="Password"
  type="password"
  error="Password is required"
  isInvalid
/>
```

### Badge
```tsx
import { Badge, StatusBadge } from '@/components/ui';

<Badge type="blue">New</Badge>
<Badge variant="success" size="sm">Active</Badge>

<StatusBadge status="success">Completed</StatusBadge>
<StatusBadge status="pending" size="sm">In Progress</StatusBadge>
```

### Modal
```tsx
import { Modal, ModalFooter } from '@/components/ui';

<Modal 
  isOpen={isOpen} 
  onClose={closeModal}
  title="Confirm Action"
  size="md"
  footer={<ModalFooter onCancel={closeModal} onConfirm={handleConfirm} />}
>
  <p>Are you sure you want to proceed?</p>
</Modal>
```

### Toast
```tsx
import { useToast } from '@/components/ui';

function MyComponent() {
  const { showToast } = useToast();
  
  const handleSuccess = () => {
    showToast('Success!', 'Item saved successfully', 'success');
  };
  
  return <button onClick={handleSuccess}>Save</button>;
}
```

## Backward Compatibility

The implementation maintains backward compatibility with existing code:

- Legacy Button variants (`outline`, `success`) are mapped to Carbon equivalents
- Legacy Badge props (`variant`) are supported alongside new `type` prop
- Legacy StatusBadge status values are supported
- Legacy Input `size` prop works alongside new `inputSize` prop
- Legacy Modal `xl` size is supported
- Legacy ConfirmationDialog props (`description`, `confirmLabel`, `danger`, `variant`) work
- Legacy Toast API (`showToast(title, message, type)`) is supported

## Accessibility

- All components follow WCAG 2.1 AA standards
- Proper focus management with visible focus indicators
- ARIA attributes for screen readers
- Reduced motion support via `prefers-reduced-motion`
- High contrast mode support

## Theming

Carbon's white theme is active by default. To enable dark theme or other themes:

```tsx
import { Theme } from '@carbon/react';

<Theme theme="g100"> {/* g100 is Carbon's dark theme */}
  <YourApp />
</Theme>
```

## Resources

- [IBM Carbon Design System](https://carbondesignsystem.com/)
- [Carbon React Components](https://react.carbondesignsystem.com/)
- [Carbon Icons](https://carbon-icons.netlify.app/)
