# Assets Creation Guide

This guide explains how to create and configure app icons and splash screens for PlayBeacon.

## Required Assets

### App Icon (icon.png)
- **Size**: 1024x1024 px
- **Format**: PNG with transparency
- **Location**: `./assets/icon.png`
- **Usage**: Main app icon shown on device home screen

### Adaptive Icon (Android)
- **Foreground**: 1024x1024 px PNG
- **Location**: `./assets/adaptive-icon.png`
- **Background Color**: `#5B21B6` (Purple - configured in app.json)
- **Safe Zone**: Keep important elements within the center 66% circle
- **Usage**: Android adaptive icon system (supports various shapes)

### Splash Screen
- **Image Size**: 1284x2778 px (iPhone 14 Pro Max resolution)
- **Format**: PNG
- **Location**: `./assets/splash.png`
- **Background Color**: `#5B21B6` (Purple - configured in app.json)
- **Resize Mode**: `contain` (image will be centered and scaled)
- **Usage**: Shown while app is loading

### Favicon (Web)
- **Size**: 48x48 px
- **Format**: PNG or ICO
- **Location**: `./assets/favicon.png`
- **Usage**: Browser tab icon for web version

## Design Guidelines

### Brand Colors
- **Primary Purple**: `#5B21B6` (Violet-800)
- **Background**: Purple gradient or solid
- **Text/Icons**: White or light colors for contrast

### Icon Design Best Practices
1. **Simple and Recognizable**: Icon should be clear at small sizes
2. **No Text**: Avoid text in the icon (use symbols/logos only)
3. **Consistent Style**: Match your brand identity
4. **High Contrast**: Ensure visibility on various backgrounds
5. **Safe Zones**: Keep important elements away from edges

### Splash Screen Best Practices
1. **Brand Consistency**: Use brand colors and logo
2. **Simple Design**: Avoid complex animations or multiple elements
3. **Fast Loading**: Keep file size reasonable (< 1MB)
4. **Centered Content**: Important elements in the center

## Creating Assets

### Option 1: Using Design Tools

**Figma/Sketch/Adobe XD**:
1. Create artboard with required dimensions
2. Design your icon/splash with brand colors
3. Export as PNG at @1x scale (actual pixels)

**Photoshop/GIMP**:
1. Create new document with exact dimensions
2. Design with transparent background (for icons)
3. Export as PNG-24 for transparency support

### Option 2: Using Expo Asset Generator

Expo provides tools to generate all required sizes from a single source:

```bash
# Install @expo/image-utils
npm install -g @expo/image-utils

# This will be done automatically during EAS build
# if you provide the base icon.png file
```

### Option 3: Online Generators

**Icon Generators**:
- [App Icon Generator](https://www.appicon.co/)
- [Icon Bakery](https://icon.kitchen/)
- [MakeAppIcon](https://makeappicon.com/)

Upload your 1024x1024 icon and download all sizes.

**Splash Screen Tools**:
- [Ape Tools](https://apetools.webprofusion.com/tools/imagegorilla)
- Create manually in design tools

## Quick Start Templates

### Icon Template Specifications

```
Dimensions: 1024x1024 px
Background: #5B21B6 (or gradient)
Logo/Symbol: Centered, white or light color
Padding: 128px from edges (safe zone)
Format: PNG-24 with transparency
```

### Splash Screen Template

```
Dimensions: 1284x2778 px
Background: Solid #5B21B6 or gradient
Logo: Centered, scaled appropriately
Text: "PlayBeacon" (optional, below logo)
Format: PNG-24
```

### Adaptive Icon Template

```
Dimensions: 1024x1024 px
Safe Circle: 684px diameter (center)
Foreground: Logo/symbol only
Background: Defined in app.json (#5B21B6)
Format: PNG-24 with transparency
```

## Installing Assets

1. **Create assets** using any of the methods above

2. **Place files** in the correct locations:
   ```
   mobile-app/
   ├── assets/
   │   ├── icon.png           (1024x1024)
   │   ├── adaptive-icon.png  (1024x1024)
   │   ├── splash.png         (1284x2778)
   │   └── favicon.png        (48x48)
   ```

3. **Verify configuration** in `app.json`:
   ```json
   {
     "expo": {
       "icon": "./assets/icon.png",
       "splash": {
         "image": "./assets/splash.png",
         "backgroundColor": "#5B21B6"
       },
       "android": {
         "adaptiveIcon": {
           "foregroundImage": "./assets/adaptive-icon.png",
           "backgroundColor": "#5B21B6"
         }
       }
     }
   }
   ```

4. **Test locally**:
   ```bash
   npx expo start --clear
   ```

5. **Build with EAS**:
   ```bash
   eas build --platform ios --profile preview
   eas build --platform android --profile preview
   ```

## Asset Validation

Before building, verify:

- [ ] All files exist in `./assets/` directory
- [ ] Icon.png is exactly 1024x1024 px
- [ ] Adaptive-icon.png is exactly 1024x1024 px
- [ ] Splash.png is 1284x2778 px or larger
- [ ] All PNGs use RGB color mode (not CMYK)
- [ ] Icons have transparent backgrounds
- [ ] File sizes are reasonable (< 1MB each)
- [ ] Brand colors are consistent (#5B21B6)

## Updating Assets

To update assets after initial setup:

1. Replace files in `./assets/` directory
2. Clear Expo cache: `npx expo start --clear`
3. Rebuild the app: `eas build --platform all`
4. Test on real devices before submitting

## Asset Optimization

### PNG Optimization
Use tools to reduce file size without quality loss:

```bash
# Using ImageOptim (Mac)
imageoptim ./assets/*.png

# Using pngquant
pngquant --quality=80-90 ./assets/*.png

# Using TinyPNG API
tinypng ./assets/*.png
```

### Recommended Max Sizes
- Icon: 200 KB
- Adaptive Icon: 200 KB
- Splash Screen: 500 KB
- Favicon: 20 KB

## Platform-Specific Notes

### iOS
- Icon will be automatically resized for all iOS icon sizes
- Rounded corners applied automatically by iOS
- No transparency in final icon (even if PNG has alpha)
- Requires icon.png at 1024x1024

### Android
- Adaptive icon allows different shapes per device manufacturer
- Keep important content in center circle (safe zone)
- Background color fills behind foreground
- Supports multiple formats via adaptive icons

### Web
- Favicon should be simple and recognizable at small sizes
- Consider creating multiple sizes (16x16, 32x32, 48x48)
- PWA may require additional manifest icons

## Troubleshooting

**Icon not updating**:
- Clear Expo cache: `npx expo start --clear`
- Clear build cache: `eas build --clear-cache`
- Verify file paths in app.json

**Splash screen looks stretched**:
- Check image dimensions
- Verify `resizeMode` is set to `contain`
- Ensure aspect ratio matches common device ratios

**Android adaptive icon clipped**:
- Keep important elements within center 66% circle
- Test on different device shapes using Android Studio

**Build fails with asset errors**:
- Verify all files exist at specified paths
- Check file permissions
- Ensure PNG format is correct (RGB, not CMYK)

## Resources

- [Expo Assets Documentation](https://docs.expo.dev/develop/user-interface/assets/)
- [iOS App Icon Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Android Adaptive Icons](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive)
- [Material Design Icons](https://material.io/design/iconography)
