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
9. Make the circle buttons a tiny bit smaller
10. Make the circles centred
<!-- 11. It's not properly using the search.ch API to get the nicely formatted stop names when doing location detection -->
12. When refreshing timings, make it cache the old timing then once the new timings have been fully fetched and fully recieved then replace the old timings with the new timings seamlessly so it doesn't show a loading wheel
13. Make it easier to configure settings in a file. For example, the old javascript code had a part at the top to configure it but maybe we can have config.json:

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
}
14. Make the search autocompletions hover above the bus/tram numbers text box and have a done button on the keyboard to close the keyboard and suggestions
15. Make all the icons for the bus/tram numbers always be in the same place for each "stop session"(Each time viewing timings for one stop but if you go to a different stop, it's a different session and even if you go back to the same stop, it's a different session)
16. Allow scrolling up a bit in the popup so the user can see more times(If there are more times than the popup can fit)
17. Make the cells have a yellow background colour when there is a delay of any time
18. Right now, I think when the time format is minutes, it calculates the delays but doesn't show a warning but if the time format is 24 hour time, it doesn't calculate the delays and doesn't show the warnings
19. When exiting the text box, it should clear the autocompletions
21. Make it update the timings every time one of the circle buttons are pressed if it has been more than 6 seconds since the last update/press on circle button
22. The tab names don't change language when I switch language


# LAST:
- Make sure it is accessible
- Add a tutorial for the first time opening the app and optional re-do tutorial in settings screen but add a skip button and make it one of those interactive ones so there is a small box showing instructions for something then you do the action and click next and the first page when opening the app for the first time is en/fr selection
- Make sure all the text is properly available in both english and french


- Try to reduce the system resource usage as much as possible without removing features and only removing bloat and stuff.