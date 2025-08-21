/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: "widget",
  icon: "../../assets/images/ios-light.png",
  colors: {
    primary: {
      light: "#FF6600",
      dark: "#FF6600",
    },
    background: {
      light: "#FFFFFF",
      dark: "#1C1C1E",
    },
    text: {
      light: "#000000", 
      dark: "#FFFFFF",
    },
    $accent: "#FF6600",
    $widgetBackground: "#FFFFFF",
  },
  entitlements: {
    "com.apple.security.application-groups": ["group.tpg.data"],
  },
  images: {
    tpgLogo: "../../assets/images/ios-light.png",
  },
};