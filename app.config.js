const IS_DEV = process.env.EAS_BUILD_PROFILE === "development";

export default {
  "expo": {
    "name": IS_DEV ? "TPG Times (Dev)" : "TPG Times",
    "slug": IS_DEV ? "tpg-times-dev" : "tpg-times",
    "updates": {
      "url": "https://u.expo.dev/7d689592-1fb0-4eb4-963f-6493cb6a9cb3",
      "fallbackToCacheTimeout": 0,
      "checkAutomatically": "ON_LOAD",
      "enabled": true
    },
    "orientation": "portrait",
    "scheme": IS_DEV ? "tpgtimes-dev" : "tpgtimes",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": IS_DEV ? "com.rohanodwyer.tpgtimes.dev" : "com.rohanodwyer.tpgtimes",
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      },
      "icon": {
        "light": "./assets/images/ios-light.png",
        "dark": "./assets/images/ios-dark.png",
        "tinted": "./assets/images/ios-tinted.png"
      }
    },
    "web": {
      "output": "single",
      "favicon": "./assets/images/favicon.png",
      "name": IS_DEV ? "TPG Times (Dev)" : "TPG Times",
      "shortName": IS_DEV ? "TPG Dev" : "TPG Times",
      "startUrl": ".",
      "scope": "/",
      "themeColor": "#FF6600",
      "backgroundColor": "#ffffff",
      "crossorigin": "use-credentials"
    },
    "plugins": [
      "expo-updates",
      "expo-router",
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "${PRODUCT_NAME} needs to access your location to show you nearby stops"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {
        "origin": false
      },
      "eas": {
        "projectId": "7d689592-1fb0-4eb4-963f-6493cb6a9cb3"
      }
    },
    "android": {
      "package": IS_DEV ? "com.rohanodwyer.tpgtimes.dev" : "com.rohanodwyer.tpgtimes",
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/ios-light.png",
        "monochromeImage": "./assets/images/ios-dark.png"
      }
    },
    "runtimeVersion": {
      "policy": "appVersion"
    },
    "owner": "majulahsingapura"
  }
};