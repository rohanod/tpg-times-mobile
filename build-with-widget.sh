#!/bin/bash

# TPG Times iOS Build Script with Widget Support
# This script builds the iOS app with the widget extension

echo "🚀 Building TPG Times with Widget Support..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf ios

# Generate iOS project with widget support
echo "📱 Generating iOS project..."
npx expo prebuild --platform ios --clean

# Build the project with automatic provisioning
echo "🔨 Building iOS project..."
cd ios

# Enable automatic signing for both main app and widget
xcodebuild -workspace TPGTimes.xcworkspace \
  -scheme TPGTimes \
  -configuration Release \
  -destination "id=00008110-001129212111401E" \
  -allowProvisioningUpdates \
  CODE_SIGN_STYLE=Automatic \
  DEVELOPMENT_TEAM="" \
  build

if [ $? -eq 0 ]; then
  echo "✅ Build completed successfully!"
  echo "📱 Installing on device..."
  
  # Install the app
  xcodebuild -workspace TPGTimes.xcworkspace \
    -scheme TPGTimes \
    -configuration Release \
    -destination "id=00008110-001129212111401E" \
    -allowProvisioningUpdates \
    CODE_SIGN_STYLE=Automatic \
    DEVELOPMENT_TEAM="" \
    install
    
  if [ $? -eq 0 ]; then
    echo "🎉 App installed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Open the TPG Times app on your device"
    echo "2. Go to Settings → Configure Widget"
    echo "3. Select a stop and configure your widget"
    echo "4. Add the widget to your home screen:"
    echo "   - Long press on home screen"
    echo "   - Tap the + button"
    echo "   - Search for 'TPG Times'"
    echo "   - Add and configure the widget"
  else
    echo "❌ Installation failed"
    exit 1
  fi
else
  echo "❌ Build failed"
  exit 1
fi