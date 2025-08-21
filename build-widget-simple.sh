#!/bin/bash

# Simple TPG Times iOS Build Script with Widget Support
echo "🚀 Building TPG Times with Widget Support (Simple Method)..."

# Clean and regenerate
echo "🧹 Cleaning and regenerating iOS project..."
rm -rf ios
npx expo prebuild --platform ios --clean

echo "🔑 Setting up code signing..."

# Try to detect the development team
TEAM_ID=$(security find-identity -v -p codesigning | grep "iPhone Developer\|Apple Development" | head -1 | sed 's/.*(\([A-Z0-9]*\)).*/\1/')

if [ -z "$TEAM_ID" ]; then
  echo "⚠️  Could not detect development team automatically."
  echo "📝 Please open ios/TPGTimes.xcworkspace in Xcode and:"
  echo "   1. Select the TPGTimes project"
  echo "   2. Go to Signing & Capabilities"
  echo "   3. Enable 'Automatically manage signing' for both TPGTimes and tpgwidget targets"
  echo "   4. Select your development team"
  echo "   5. Build and run from Xcode (⌘+R)"
  echo ""
  echo "🎯 Alternatively, you can set your team ID manually:"
  echo "   export EXPO_APPLE_TEAM_ID=YOUR_TEAM_ID"
  echo "   then run this script again"
  
  if [ ! -z "$EXPO_APPLE_TEAM_ID" ]; then
    echo "✅ Using team ID from environment: $EXPO_APPLE_TEAM_ID"
    TEAM_ID="$EXPO_APPLE_TEAM_ID"
  else
    echo "❌ No team ID available. Please follow the manual steps above."
    exit 1
  fi
else
  echo "✅ Found development team: $TEAM_ID"
  export EXPO_APPLE_TEAM_ID="$TEAM_ID"
fi

# Update the app config with the team ID
echo "📝 Updating app configuration with team ID..."
node -e "
const fs = require('fs');
const config = fs.readFileSync('app.config.js', 'utf8');
const updated = config.replace(
  /appleTeamId: \".*?\"/,
  \`appleTeamId: \"$TEAM_ID\"\`
).replace(
  /\/\/ appleTeamId will be determined automatically by Xcode/,
  \`appleTeamId: \"$TEAM_ID\"\`
);
fs.writeFileSync('app.config.js', updated);
console.log('✅ Updated app.config.js with team ID');
"

# Regenerate with the team ID
echo "🔄 Regenerating project with team ID..."
npx expo prebuild --platform ios --clean

# Build and install
echo "🔨 Building and installing..."
npx expo run:ios --device 00008110-001129212111401E --configuration Release

if [ $? -eq 0 ]; then
  echo "🎉 Build and installation completed successfully!"
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
  echo "❌ Build failed. Please check the error messages above."
  echo "💡 Try opening ios/TPGTimes.xcworkspace in Xcode and building manually."
  exit 1
fi