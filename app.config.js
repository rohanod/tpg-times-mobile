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


export default {
  expo: {
    name: getAppName(),
    slug: IS_DEV ? "tpg-times-dev" : "tpg-times",
    updates: {
      url: "https://u.expo.dev/7d689592-1fb0-4eb4-963f-6493cb6a9cb3",
      fallbackToCacheTimeout: 0,
      checkAutomatically: "ON_LOAD",
      enabled: true
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
      catalyst: {
        enabled: true
      }
    },
    web: {
      output: "single",
      favicon: "./assets/images/favicon.png",
      name: IS_DEV ? "TPG Times (Dev)" : "TPG Times",
      shortName: IS_DEV ? "TPG Dev" : "TPG Times",
      startUrl: ".",
      scope: "/",
      themeColor: "#FF6600",
      backgroundColor: "#ffffff",
      crossorigin: "use-credentials"
    },
    plugins: [
      "expo-updates",
      "expo-router",
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