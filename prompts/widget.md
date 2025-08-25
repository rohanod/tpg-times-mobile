Implement a widget where the user can choose any stop with free text input and optional number filter and it will show the timings for that stop in the widget. In the repo, there is a README.md and an example folder. This is the url for the repo. Clone it and analyse it: https://github.com/EvanBacon/expo-apple-widget-example. Make it integrate properly with the deploy:iphone and run:iphone script. Use all the tools to help. First create a full 20+ step plan. Clone the repo here not at /tmp.

Create the draft plans and ask a few(or many) short questions to fully clarify everything

Make it so pnpm deploy:iphone works. Helpful links to use:

https://github.com/EvanBacon/expo-stock-widget-example(clone)
https://github.com/EvanBacon/expo-apple-widget-example(clone)
https://github.com/EvanBacon/expo-apple-targets(clone)
https://evanbacon.dev/blog/apple-home-screen-widgets(read)
https://medium.com/inkitt-tech/live-activity-widget-in-expo-react-native-project-607df51f8a15(read)

If you need to use any interactive setup things(for expo apple targets) tell me with the parameters and I will set it up and give back to you

It should show the next 4 departures for each bus/tram number and use the full width of the screen to have the ui look like this table(Do not use a table but just use it as a reference)

| Bus/Tram | Time | Destination |
|----------|------|-------------|
| 14      | 10:00 | Bernex, Vailly |
| 10      | 10:05 | Geneve, Rive |
| 22      | 10:10 | Jardin Botanique |

The bus/tram will be in a square with the background color of the bus/tram number

Only allow one stop per widget.

Make it have the same theme as the app.

Refresh every 2 minutes and have a small refresh button in the top right corner.

Just use the same code that the main app uses for the departures.

Do not allow offline mode.

If you need to use any interactive setup things(for expo apple targets) tell me with the parameters and I will set it up and give back to you

As I said before, use the full width but have 4 rows of bus and tram departures(departures, not bus/tram lines so just the next departures for any bus/tram number) and allow expanding the height of the widget to show more departures. Make it dynamically adjust the amount of rows to show based on the height of the widget.

First do a bunch of research and planning and put all the steps in a markdown file. Do not start coding until you have a plan and have done all the research and have a full understanding of the project.

I have initialised the widget by doing this:

First analyse the widget code at targets/widget/* and git clone the examples here(not /tmp) and analyse them.

(base) ➜  tpg-times-mobile git:(main) ✗ npx create-target widget
[bacons/apple-targets] Expo config is missing required ios.appleTeamId property. Find this in Xcode and add to the Expo Config to correct. iOS builds may fail until this is corrected.
Creating a widget Apple target.

Writing expo-target.config.js file
Writing Info.plist file
Target created! Run npx expo prebuild -p ios to fully generate the target. Develop native code in Xcode.


You will also need to fully analyse the main project ar src/ so you can use the same code for the widget.

First analyse, make a full plan in markdown along with any guiding information for another agent to follow. Once you make the widget-plan.md, create a prompt at prompt.md to tell the agent to follow the plan and clarify some things. You will not be able to communicate with the agent after this. If the agent cannot complete the task, you and it will be decomissioned.

The plan will be at widget-plan.md

Extra clarification:

- You do not need the team id, I will configure it myself.
- Make sure the widget takes the data from search.ch through the app and not from the search.ch api directly
- I suggested 2 minutes being the refresh interval, that is the minimum, make a good suggestion based on the rate limits of widgetkit
- Make sure the widget follows the theme of the phone properly
- The app already has code for getting the line colour so use that
- The configuration for the widget will be through the home screen widget settings. Figure out how to do this.
- Allow multiple widgets with different stops
- When the device is offline, the widget should show an error message
- Have it configurable in the widget setup to choose 24 hour time or minutes until next departure(Always taking into account any delays)
- Allow both English and French for the widget

## Alternative Configuration: Deep Linking (Highly Recommended)

Instead of configuring the widget using the native flow, implement a deep-linking system where users tap the widget to open the app for configuration. This ensures they know exactly which widget they're configuring when they have multiple widgets, and provides access to our arrets.csv stop suggestions database.