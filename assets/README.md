# PlayBeacon App Assets

This directory contains all visual assets for the PlayBeacon mobile app.

## Required Files

Before building for production, you must create the following asset files:

### 1. App Icon
- **Filename**: `icon.png`
- **Size**: 1024x1024 px
- **Format**: PNG with transparency
- **Purpose**: Main app icon displayed on device home screens

### 2. Adaptive Icon (Android)
- **Filename**: `adaptive-icon.png`
- **Size**: 1024x1024 px
- **Format**: PNG with transparency
- **Purpose**: Foreground layer for Android adaptive icons
- **Note**: Keep important content within center 684px circle (safe zone)

### 3. Splash Screen
- **Filename**: `splash.png`
- **Size**: 1284x2778 px (or higher resolution)
- **Format**: PNG
- **Purpose**: Launch screen shown while app loads

### 4. Favicon
- **Filename**: `favicon.png`
- **Size**: 48x48 px
- **Format**: PNG or ICO
- **Purpose**: Browser tab icon for web version

## Design Specifications

### Brand Colors
- **Primary**: `#5B21B6` (Violet-800)
- **Background**: Purple (#5B21B6) or gradient

### Design Guidelines
1. Use PlayBeacon branding consistently
2. Maintain high contrast for visibility
3. Keep icons simple and recognizable at small sizes
4. Use transparent backgrounds for icons
5. Test on multiple device types

## Creating Assets

See [ASSETS_GUIDE.md](../ASSETS_GUIDE.md) for detailed instructions on:
- Design specifications and templates
- Tools and generators
- Platform-specific requirements
- Optimization techniques
- Troubleshooting

## Quick Start

1. **Option 1: Use a design tool**
   - Create assets in Figma, Sketch, Photoshop, etc.
   - Export at exact dimensions specified above
   - Place files in this directory

2. **Option 2: Use an online generator**
   - Visit [App Icon Generator](https://www.appicon.co/)
   - Upload your base 1024x1024 design
   - Download and extract files to this directory

3. **Option 3: Hire a designer**
   - Provide the specifications from ASSETS_GUIDE.md
   - Request PNG files at specified dimensions
   - Place files in this directory

## Validation Checklist

Before building, ensure:
- [ ] icon.png exists and is 1024x1024 px
- [ ] adaptive-icon.png exists and is 1024x1024 px
- [ ] splash.png exists and is 1284x2778 px
- [ ] favicon.png exists and is 48x48 px
- [ ] All files use RGB color mode (not CMYK)
- [ ] Icons have transparent backgrounds
- [ ] Brand color #5B21B6 is used consistently
- [ ] File sizes are optimized (< 1MB each)

## Current Status

**ASSETS REQUIRED**: This directory needs to be populated with actual asset files before production builds.

The placeholder files currently referenced in `app.json` must be replaced with properly designed assets following the specifications in [ASSETS_GUIDE.md](../ASSETS_GUIDE.md).

## Resources

- [Expo Assets Documentation](https://docs.expo.dev/develop/user-interface/assets/)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Android Adaptive Icons](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive)
