# ExpandableText Component

A responsive React component that truncates long text content and provides expand/collapse functionality with "Xem thêm" (Show more) and "Thu gọn" (Collapse) buttons.

## Features

- **Responsive Design**: Automatically adjusts max length based on screen size
  - Mobile (< 640px): 60% of base max length
  - Tablet (640px - 1024px): 80% of base max length  
  - Desktop (> 1024px): Full max length
- **HTML Support**: Can render HTML content safely
- **Customizable**: Fully customizable styling and text
- **Accessible**: Includes proper ARIA attributes
- **Vietnamese Localization**: Default button text in Vietnamese

## Usage

### Basic Text
```tsx
<ExpandableText 
  text="Long text content here..." 
  maxLength={200}
/>
```

### HTML Content
```tsx
<ExpandableText 
  text="<p>HTML content with <strong>formatting</strong></p>" 
  maxLength={300}
  isHtml={true}
/>
```

### Custom Styling
```tsx
<ExpandableText 
  text="Content here..."
  maxLength={250}
  textClassName="text-gray-700 leading-relaxed"
  buttonClassName="custom-button-styles"
  style={{ fontSize: 'clamp(14px, 3.5vw, 18px)' }}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | - | The text content to display (required) |
| `maxLength` | `number` | `200` | Base maximum length before truncation |
| `className` | `string` | `""` | CSS classes for the container |
| `showMoreText` | `string` | `"Xem thêm"` | Text for expand button |
| `showLessText` | `string` | `"Thu gọn"` | Text for collapse button |
| `buttonClassName` | `string` | `""` | CSS classes for the button |
| `textClassName` | `string` | `""` | CSS classes for the text content |
| `isHtml` | `boolean` | `false` | Whether to render content as HTML |
| `style` | `React.CSSProperties` | `{}` | Inline styles for the container |

## Responsive Behavior

The component automatically adjusts the truncation length based on screen size:

- **Mobile**: Shows 60% of the specified `maxLength`
- **Tablet**: Shows 80% of the specified `maxLength`  
- **Desktop**: Shows the full `maxLength`

This ensures optimal reading experience across all device types.

## Integration Example

Used in the Memorial Profile Web component for biography and comment sections:

```tsx
// Biography section
<ExpandableText
  text={profile.biography}
  maxLength={400}
  isHtml={true}
  textClassName="text-gray-700 leading-relaxed"
  style={{ fontSize: 'clamp(14px, 3.5vw, 18px)' }}
/>

// Comments section
<ExpandableText
  text={comment.message}
  maxLength={200}
  textClassName="text-slate-600 leading-relaxed"
  style={{ fontSize: 'clamp(13px, 3.2vw, 16px)' }}
/>
```

## Styling

The component uses default Tailwind CSS classes for the expand/collapse button:
- Blue color scheme with hover effects
- Rounded corners and subtle shadows
- Smooth transitions
- Focus states for accessibility

You can override these styles by providing a custom `buttonClassName` prop.