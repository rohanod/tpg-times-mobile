/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: "widget",
  icon: "../../assets/images/ios-light.png",
  colors: {
    $accent: "#FF6600",
    $widgetBackground: "#FFFFFF",
  },
  entitlements: {
    "com.apple.security.application-groups": ["group.com.rohanodwyer.tpgtimes"],
  },
};