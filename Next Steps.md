<!-- 1. Remove the times page properly and fix any things that might refer to it -->
<!-- 2. Use the arrets.csv filtering and checking like the js code has(JS code is in website.js) -->
<!-- 3. Make the settings work because switching between light mode and dark mode doesn't work and switching between having the format in minutes and having the format in 24 hour time doesn't work -->
3.5. Make the settings work because switching between light mode and dark mode doesn't work(Just the text constantly says "dark mode") and switching between having the format in minutes until next bux/tram and having the format in 24 hour time doesn't work(Again just the text stays the same)
4. Allow tapping outside the timings popup to exit it
5. Make the 4 timings in a grid and make them a tiny bit wider to look better
6. Allow pulling the popup up to show more timings if applicable not just immediately scrolling, moving the popup up to mostly fill the screen then scrolling if needed when the user swipes up from the popup
7. Make the shadow not go up with the popup, make it fade in so it looks nicer
8. Keep when you show the number filters consistent so have it always show stop name text box and always show bus/tram nu,ber textbox
9. Properly implement favourite stops properly so in the favourites page, it has a button that says "Add current stop to favourites"
10. Make the circle buttons a tiny bit smaller
11. Make the circles centred
12. It's not properly using the search.ch API to get the nicely formatted stop names when doing location detection
13. When refreshing timings, make it cache the old timing then once the new timings have been fully fetched and fully recieved then replace the old timings with the new timings seamlessly so it doesn't show a loading wheel
14. Make it easier to configure settings in a file. For example, the old javascript code had a part at the top to configure it but maybe we can have config.json:

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
15. Make the search autocompletions hover above the bus/tram numbers text box and have a done button on the keyboard to close the keyboard and suggestions
16. Make all the icons for the bus/tram numbers always be in the same place for each "stop session"(Each time viewing timings for one stop but if you go to a different stop, it's a different session and even if you go back to the same stop, it's a different session)