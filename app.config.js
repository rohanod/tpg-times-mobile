const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return 'com.rohanodwyer.tpgtimes.dev';
  }

  if (IS_PREVIEW) {
    return 'com.rohanodwyer.tpgtimes.preview';
  }

  return 'com.rohanodwyer.tpgtimes';
};

const getAppName = () => {
  if (IS_DEV) {
    return 'TPG Times (Dev)';
  }

  if (IS_PREVIEW) {
    return 'TPG Times (Preview)';
  }

  return 'TPG Times';
};


// Keep runtime and channel headers consistent across build variants
const pkg = require('./package.json');

export default {
  expo: {
    name: getAppName(),
    slug: IS_DEV ? "tpg-times-dev" : "tpg-times",
    version: pkg.version,
    updates: {
      url: "https://u.expo.dev/7d689592-1fb0-4eb4-963f-6493cb6a9cb3",
      fallbackToCacheTimeout: 0,
      checkAutomatically: "ON_LOAD",
      enabled: true,
      requestHeaders: {
        // Provide a default channel header for local and EAS builds.
        // EAS builds will override this based on the build profile's `channel`.
        'expo-channel-name': 'production'
      }
    },
    orientation: "portrait",
    scheme: IS_DEV ? "tpgtimes-dev" : "tpgtimes",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: getUniqueIdentifier(),
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      },
      icon: {
        light: "./assets/images/ios-light.png",
        dark: "./assets/images/ios-dark.png",
        tinted: "./assets/images/ios-tinted.png"
      },
    },
    web: {
      output: "single",
      favicon: "./assets/images/ios-light.png",
      name: IS_DEV ? "TPG Times (Dev)" : "TPG Times",
      shortName: IS_DEV ? "TPG Dev" : "TPG Times",
      startUrl: ".",
      scope: "/",
      themeColor: "#FF6600",
      backgroundColor: "#ffffff",
      crossorigin: "use-credentials",
      // PWA specific settings to disable zooming and improve behavior
      meta: {
        viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
      },
      build: {
        babel: {
          include: ["@expo/vector-icons"]
        }
      }
    },
    plugins: [
      "expo-updates",
      "expo-router",
      "expo-font",
      [
        "expo-location",
        {
          locationWhenInUsePermission: "${PRODUCT_NAME} needs to access your location to show you nearby stops"
        }
      ],
      [
        "expo-build-properties",
        {
          ios: {
            useHermes: false
          }
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      buildCacheProvider: "eas"
    },
    extra: {
      router: {
        origin: false
      },
      eas: {
        projectId: "7d689592-1fb0-4eb4-963f-6493cb6a9cb3"
      }
    },
    android: {
      package: getUniqueIdentifier(),
      softwareKeyboardLayoutMode: 'pan',
      adaptiveIcon: {
        foregroundImage: "./assets/images/ios-light.png",
        monochromeImage: "./assets/images/ios-dark.png"
      }
    },
    runtimeVersion: {
      policy: "appVersion"
    },
    owner: "majulahsingapura",
  
  }
};
