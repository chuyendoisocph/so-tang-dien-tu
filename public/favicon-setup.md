# Favicon Setup Guide

## Files cần tạo và đặt trong thư mục public/:

### 1. favicon.ico (bắt buộc)
- Kích thước: 16x16, 32x32, 48x48px trong 1 file
- Đặt tại: `public/favicon.ico`

### 2. PNG favicons
- `favicon-16x16.png` - 16x16px
- `favicon-32x32.png` - 32x32px

### 3. Mobile icons
- `apple-touch-icon.png` - 180x180px (cho iOS)
- `android-chrome-192x192.png` - 192x192px
- `android-chrome-512x512.png` - 512x512px

## Cách tạo từ logo gốc:

1. **Chuẩn bị logo gốc** - SVG hoặc PNG chất lượng cao
2. **Sử dụng online tools:**
   - https://favicon.io/favicon-converter/
   - https://realfavicongenerator.net/
3. **Hoặc dùng tools:**
   - ImageMagick
   - GIMP
   - Photoshop

## Kiểm tra:
- Mở browser dev tools > Application > Manifest
- Hoặc xem trong tab browser có hiển thị icon không