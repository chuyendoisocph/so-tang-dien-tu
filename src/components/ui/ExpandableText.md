# ExpandableText Component

A responsive component that provides "Read More" functionality for long text content, specifically designed for mobile devices.

## Features

- **Mobile-first**: Only shows expand/collapse functionality on mobile screens (< 640px)
- **HTML Support**: Can handle both plain text and HTML content with proper truncation
- **Responsive**: Automatically detects screen size and adjusts behavior
- **Customizable**: Configurable text length limits and styling
- **Accessible**: Proper button styling with hover states

## Usage

### Basic Text
```tsx
<ExpandableText
  text="This is a long text that will be truncated on mobile devices..."
  maxLength={150}
/>
```

### HTML Content
```tsx
<ExpandableText
  text="<p>This is <strong>HTML content</strong> that will be properly truncated...</p>"
  maxLength={200}
  isHtml={true}
/>
```

### Custom Styling
```tsx
<ExpandableText
  text="Custom styled text..."
  maxLength={100}
  style={{
    fontSize: '16px',
    color: '#333',
    lineHeight: 1.6
  }}
  className="custom-class"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | - | The text content to display (required) |
| `maxLength` | `number` | - | Maximum characters before truncation (required) |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `React.CSSProperties` | `{}` | Inline styles for the container |
| `isHtml` | `boolean` | `false` | Whether the text contains HTML content |
| `showOnMobile` | `boolean` | `true` | Whether to show expand/collapse on mobile |

## Behavior

- **Desktop/Tablet**: Shows full text content without truncation
- **Mobile**: Shows truncated text with "Xem thêm" (Read More) button
- **Expanded**: Shows full text with "Thu gọn" (Collapse) button
- **HTML Mode**: Properly handles HTML tags during truncation

## Styling

The component uses the application's design system colors:
- Button color: `#C5A059` (GOLD_ACCENT)
- Hover color: `#1e3a5f` (NAVY_PRIMARY)
- Responsive font sizing with `clamp()`

## Implementation Notes

- Uses `useExpandableText` hook for state management
- Implements proper HTML truncation that preserves tag structure
- Responsive breakpoint: 640px (Tailwind's `sm` breakpoint)
- Automatically strips HTML tags for length calculation
- Includes hover effects and smooth transitions