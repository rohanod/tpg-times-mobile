<!-- 1. Remove the times page properly and fix any things that might refer to it -->
<!-- 2. Use the arrets.csv filtering and checking like the js code has(JS code is in website.js) -->
<!-- 3. Make the settings work because switching between light mode and dark mode doesn't work and switching between having the format in minutes and having the format in 24 hour time doesn't work -->
<!-- 3.5. Make the settings work because switching between light mode and dark mode doesn't work(Just the text constantly says "dark mode") and switching between having the format in minutes until next bux/tram and having the format in 24 hour time doesn't work(Again just the text stays the same) -->
<!-- 4. Allow tapping outside the timings popup to exit it -->
<!-- 5. Make the 4 timings in a grid and make them a tiny bit wider to look better -->
<!-- 6. Make the shadow not go up with the popup, make it fade in so it looks nicer -->
<!-- 7. Keep when you show the number filters consistent so have it always show stop name text box and always show bus/tram number textbox -->
<!-- 7.1. Make the number filters actually work and make it a number input so no letters allowed and have the number keypad -->
<!-- 7.2. Remove the number filters. -->
<!-- 7.3. Implement a bus/tram number filter text box that will go right under the stop name and it will always be available and the purpose is to make sure it only shows the buses/trams in that box. It will work the same way it's done in the javascript. #File:website.js -->
<!-- 8. Properly implement favourite stops properly so in the favourites page, it has a button that says "Add current stop to favourites" and make sure it keeps all the bus/tram number filters from the text box so it autofills the stop name text box and the bus/tram number text box. By the way, the add to favourites button should be in the favourites menu not on any other page -->
<!-- 8.1. It doesn't actually show the stop/filters in the favourites menu. It should store the stop name and bus/tram numbers filter and then show that info so the user knows which one it is and maybe call it saved stops but first fix all the other things because I can't save stops and when I press the button, it just sends me back to home page. By the way, the add to favourites button should be in the favourites menu not on any other page -->
<!-- 9. Make the circle buttons a tiny bit smaller -->
<!-- 9.5. (Revert) Make the circle buttons a tiny bit bigger to maybe 110 -->
<!-- 10. Make the circles collectively centred -->
<!-- 11. It's not properly using the search.ch API to get the nicely formatted stop names when doing location detection -->
<!-- 12. When refreshing, make it cache the old timing then once the new timings have been fully fetched and fully received then replace the old timings with the new timings seamlessly so it doesn't show a loading wheel -->
<!-- 13. Make it easier to configure settings in a file. For example, the old javascript code had a part at the top to configure it but maybe we can have config.json but make sure EVERYTHING uses it and there isn't just a configuration option for no reason:

const API_ENDPOINTS = {
    LOCATIONS: "https://transport.opendata.ch/v1/locations",
    STATIONBOARD: "https://search.ch/timetable/api/stationboard.fr.json",
    ARRETS_CSV: "arrets.csv"
}
const TIME_CONFIG = {
    TIMEZONE: "Europe/Zurich",
    STATIONBOARD_LIMIT: 300,
    DEBOUNCE_DELAY: 600,
    REFRESH_INTERVALS: {
        NORMAL_MODE: 30000,
        UNINTERACTIVE_MODE: 20000,
        COUNTDOWN: 5000
    },
    ANIMATION_DELAYS: {
        MODAL: 300,
        VISIBILITY: 500,
        RESIZE: 500,
        DEVTOOLS: 300,
        FADE: 300
    },
    GRID_CELLS_PER_ROW: 2,
    MAX_DEPARTURES_SHOWN: 6
}
const UI_CONFIG = {
    SUGGESTIONS_LIMIT: 4,
    DEFAULT_LANGUAGE: "en",
    LANGUAGES: {
        EN: "en",
        FR: "fr"
    }
}
const URL_PARAMS = {
    DARK_MODE: "darkMode",
    LANGUAGE: "lang",
    STOP: "stop",
    NUMBERS: "numbers",
    UNINTERACTIVE: "uninteractive",
    TIME_FORMAT: "timeFormat"
}
const defaultSettings = {
    darkMode: false,
    language: UI_CONFIG.LANGUAGES.EN,
    timeFormat: "minutes"
} -->
<!-- 14. Make the search autocompletions hover above the bus/tram numbers text box but under the stop name text box. -->
<!-- 15. Make all the icons for the bus/tram numbers always be in the same place for each "stop session"(Each time viewing timings for one stop but if you go to a different stop, it's a different session and even if you go back to the same stop, it's a different session) -->
<!-- 16. Make this project use the bottom-sheet-stepper(Use context7 mcp server to find docs for react-native-bottom-sheet then look at the repo attached to see the specific parts of bottom-sheet-stepper) for the bottom sheet instead of the current implementation. The current implementation is a custom bottom sheet that is not as performant and has some issues with scrolling and gestures. The new implementation will use the bottom-sheet-stepper/react-native-bottom-sheet library which is more performant and has better support for gestures and scrolling. Use tavily-search and sequential-thinking tools to help but use brave to find out how to properly implement this and if you follow implementation instructions correctly, there won't be an error. Completely redo the popups from "scratch" and don't use existing code from this codebase but you are allowed to use this library. Keep all colours and themes just migrate over to using bottom sheet stepper/react-native-bottom-sheet.
Keep all the same colours and themes
Use the context7 mcp server to check docs for react native bottom sheet and expo if needed. Read the repo attached to find out about bottom-sheet-stepper and look at the example folder in it for more help.
Here are the github repos for the things. Clone them and analyse them:
https://github.com/mahdidavoodi7/bottom-sheet-stepper
https://github.com/gorhom/react-native-bottom-sheet -->

<!-- 17. Make the cells have a yellow background colour when there is a delay of any time -->
18. Right now, I think when the time format is minutes, it calculates the delays but doesn't show a warning but if the time format is 24 hour time, it doesn't calculate the delays and still doesn't show the warnings
<!-- 19. When exiting the text box, it should clear the autocompletions -->
<!-- 21. Make it update the timings every time one of the circle buttons are pressed if it has been more than 6 seconds since the last update/press on circle button -->
<!-- 22. The tab names don't change language when I switch language -->
<!-- 23. Don't have the white outline for the bus/tram number items -->
<!-- 24. Make the container with the bus/tram number items fill the screen but leave space for the other elements and the tabs -->
25. Add a favourites stop feature where if the user has a currently selected stop in the home page, the favourites menu will have a "Add this stop to favourites" button and once clicked on, will add the stop to favourites and if there are any filters, it will save them too. Once clicked on a favourite, it will go back to main page with stop name and bus/tram number(if applicable) filled out and make sure there is a delete button to remove a favourite. Use context7 to look through the expo docs to find expo-sqlite so that we can have it save favourites. This is python code for you to get an idea of what tool calls you should make:

id = resolve-library-name(libraryName="expo")
get-library-docs(context7CompatibleLibraryID=id, topic="sqlite")
26. Refresh arrets.csv every month but have an option to refresh manually in settings
27. Implement a widget where the user can choose any stop with free text input and optional number filter and it will show the timings for that stop in the widget. In the repo, there is a README.md and an example folder. This is the url for the repo. Clone it and analyse it: https://github.com/EvanBacon/expo-apple-widget-example
28. If the background for the bus circles are black in dark mode, add a white border but if it is white in light mode, add black border and for ones that have no colour(~~ in colour field), just have white background with black border and black text
29. Make the splash screen the animated assets/images/loading.svg
30. If there are multiple stops with the same name, just show it once
31. Add url parameters for stop name and bus/tram number filters
32. Make the border for the stop name box border, bus/tram number box border, suggestions container and individual suggestions border these colours: borderColor: darkMode ? '#333333' : '#DDDDDD'
33. Make sure there is deduplication so if the name is exactly the same, it should only show once
34. The suggestions don't appear fast enough.
35. Network requests fail too often and it sometimes doesn't even try. It also should show timings immediately after the done button is pressed.
36. When clicking on an autosuggestion, it should fill in text box and exit text box
37. Only allow scrolling if there are more than 12 bus/tram numbers
38. Is it possible to not have the phone's default dictionary for suggestions and add a custom list of suggestions? If so, let's do it.
39. Make it so the vehiclesContainer has a inverse rounded corner so that it's shape is the negative of the bus/tram number input's shape so that the circles for bus/tram numbers get cut off in a way that makes it looks like there isn't a container and they are just disappearing behind the bus/tram number input.
40. The first time I try to type a stop and wait for suggestions, it says no stops found but if I change it(Even just removing last character and re-adding it), it works. Make it so it works the first time.
41. Sometimes it "goes crazy" and just makes a lot of requests really quickly(About 150 in 5 seconds) and logs a lot of things to the console. Make it so it doesn't make too many requests.
41. Migrate to using icons from expo/vector icons: https://docs.expo.dev/guides/icons/
Bus:
```ts
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
<MaterialIcons name="directions-bus" size={24} color="black" />
```

Settings:
```ts
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
<MaterialIcons name="settings" size={24} color="black" />
```

MapPin:
```ts
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
<MaterialIcons name="location-pin" size={24} color="black" />
```

Search:
```ts
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
<MaterialIcons name="search" size={24} color="black" />
```

X:
```ts
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
<MaterialIcons name="close" size={24} color="black" />
```

Plus:
```ts
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
<MaterialIcons name="add" size={24} color="black" />
```

Refresh:
```ts
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
<MaterialIcons name="refresh" size={24} color="black" />
```

Warning:
```ts
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
<MaterialIcons name="warning-amber" size={24} color="black" />
```

# LAST:
- Make sure it is accessible
- Add a tutorial for the first time opening the app and optional re-do tutorial in settings screen but add a skip button and make it one of those interactive ones so there is a small box showing instructions for something then you do the action and click next
- Make sure all the text is properly available in both english and french
- Remove anything not needed
- Make sure it doesn't crash
- Make sure it doesn't have any bugs
- Make sure it doesn't have any security vulnerabilities


- Try to reduce the system resource usage as much as possible without removing features and only removing bloat and stuff.