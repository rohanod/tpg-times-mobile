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
16. Make this project use the react-native-bottom-sheet(Use context7 mcp server to find docs for it) for the bottom sheet instead of the current implementation. The current implementation is a custom bottom sheet that is not as performant and has some issues with scrolling and gestures. The new implementation will use the react-native-bottom-sheet library which is more performant and has better support for gestures and scrolling. Use tavily-search and sequential-thinking tools to help but use brave to find out how to properly implement the react native bottom sheet and if you follow implementation instructions correctly, there won't be an error. Completely redo the popups from "scratch" and don't use existing code from this codebase but you are allowed to use this library. Keep all colours and themes just migrate over to using react native bottom sheet.
Keep all the same colours and themes
Use the context7 mcp server to check docs for react native bottom sheet and expo if needed

17. Make the cells have a yellow background colour when there is a delay of any time
18. Right now, I think when the time format is minutes, it calculates the delays but doesn't show a warning but if the time format is 24 hour time, it doesn't calculate the delays and doesn't show the warnings
19. When exiting the text box, it should clear the autocompletions
21. Make it update the timings every time one of the circle buttons are pressed if it has been more than 6 seconds since the last update/press on circle button
22. The tab names don't change language when I switch language
23. If the bus/tram circle background is black, make it have a white outline 
24. Make the container with the timings fill the screen but leave space for the other elements and the tabs
25. Add a favourites stop feature where if the user has a currently selected stop in the home page, the favourites menu will have a "Add this stop to favourites" button and once clicked on, will add the stop to favourites and if there are any filters, it will save them too. Once clicked on a favourite, it will go back to main page with stop name and bus/tram number(if applicable) filled out and make sure there is a delete button to remove a favourite
26. Refresh arrets.csv every month but have an option to refresh manually in settings
27. Implement a widget where the user can choose any stop with free text input and optional number filter and it will show the timings for that stop in the widget. Here is the git repo with an example of doing cross platform widgets: https://github.com/ImBIOS/RNWidget you can clone it to see how they do it
28. 
29. Make the splash screen the animated assets/images/loading.svg
30. If there are multiple stops with the same name, just show it once
31. The API gives this response:

{
	"time": "2021-02-08 13:59:00",
	"*G": "S",
	"*L": "13",
	"*Z": "019351",
	"type": "strain",
	"line": "S13",
	"operator": "SOB-sob",
	"color": "039~fff~",
	"type_name": "S-Bahn",
	"terminal": {
		"id": "8503206",
		"name": "Wädenswil",
		"x": 693645,
		"y": 231669,
		"lon": 8.675218,
		"lat": 47.229306
	}
},

in color, first part is the hex code for the background colour and the second part is the hex code for the text colour(And border in our case)
32. Make the border for the stop name box border, bus/tram number box border, suggestions container and individual suggestions border these colours: borderColor: darkMode ? '#333333' : '#DDDDDD'


# LAST:
- Make sure it is accessible
- Add a tutorial for the first time opening the app and optional re-do tutorial in settings screen but add a skip button and make it one of those interactive ones so there is a small box showing instructions for something then you do the action and click next and the first page when opening the app for the first time is en/fr selection
- Make sure all the text is properly available in both english and french
- Remove anything not needed
- Make sure it doesn't crash
- Make sure it doesn't have any bugs
- Make sure it doesn't have any security vulnerabilities


- Try to reduce the system resource usage as much as possible without removing features and only removing bloat and stuff.