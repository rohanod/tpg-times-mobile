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
const SVG_CACHE = {
    LOCATION: '<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M2.08296 7C2.50448 4.48749 4.48749 2.50448 7 2.08296V0H9V2.08296C11.5125 2.50448 13.4955 4.48749 13.917 7H16V9H13.917C13.4955 11.5125 11.5125 13.4955 9 13.917V16H7V13.917C4.48749 13.4955 2.50448 11.5125 2.08296 9H0V7H2.08296ZM4 8C4 5.79086 5.79086 4 8 4C10.2091 4 12 5.79086 12 8C12 10.2091 10.2091 12 8 12C5.79086 12 4 10.2091 4 8Z" fill="currentColor"></path></g></svg>',
    NEARBY: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M12 21C15.5 17.4 19 14.1764 19 10.2C19 6.22355 15.866 3 12 3C8.13401 3 5 6.22355 5 10.2C5 14.1764 8.5 17.4 12 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8C10.8954 8 10 8.89543 10 10C10 11.1046 10.8954 12 12 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></svg>'
};
let debounceTimeout
let visibilityTimeout
let resizeTimeout
let devToolsTimeout
let uninteractiveInterval
let countdownInterval
let refreshCountdown
let uninteractiveMode = false
let stops = []
let currentStopIndex = 0
let language = localStorage.getItem("language") || defaultSettings.language
let suggestedStops = []
let userSelectedStop = false
let darkMode = localStorage.getItem("darkMode") === "true" || defaultSettings.darkMode
let timeFormat = localStorage.getItem("timeFormat") || defaultSettings.timeFormat
window.devToolsOpened = false
let isFetching = false
let selectedSuggestionIndex = -1

function closeModal(modal) {
    if (modal) {
        modal.classList.remove("active")
        modal.removeAttribute("style")
        setTimeout(() => {
            modal.style.display = "none"
        }, TIME_CONFIG.ANIMATION_DELAYS.MODAL)
    }
}
function isDevToolsOpen() {
    const threshold = 160
    const widthDiff = window.outerWidth - window.innerWidth
    const heightDiff = window.outerHeight - window.innerHeight
    return widthDiff > threshold || heightDiff > threshold
}
function updateDevToolsStatus() {
    const devToolsOpened = isDevToolsOpen()
    if (devToolsOpened !== window.devToolsOpened) {
        window.devToolsOpened = devToolsOpened
        if (window.devToolsOpened) {
            clearAllTimers()
        } else {
            if (uninteractiveMode) {
                startUninteractiveMode()
            }
        }
    }
}
function clearAllTimers() {
    if (uninteractiveInterval) {
        clearInterval(uninteractiveInterval)
        uninteractiveInterval = null
    }
    if (countdownInterval) {
        clearInterval(countdownInterval)
        countdownInterval = null
    }
    if (visibilityTimeout) {
        clearTimeout(visibilityTimeout)
        visibilityTimeout = null
    }
    if (resizeTimeout) {
        clearTimeout(resizeTimeout)
        resizeTimeout = null
    }
    if (debounceTimeout) {
        clearTimeout(debounceTimeout)
        debounceTimeout = null
    }
    if (devToolsTimeout) {
        clearTimeout(devToolsTimeout)
        devToolsTimeout = null
    }
}
function updateURLParams() {
    const newUrl = new URL(window.location);
    newUrl.searchParams.set(URL_PARAMS.DARK_MODE, darkMode);
    newUrl.searchParams.set(URL_PARAMS.LANGUAGE, language);
    newUrl.searchParams.set(URL_PARAMS.TIME_FORMAT, timeFormat);
    if (uninteractiveMode) {
        stops.forEach((stop, index) => {
            newUrl.searchParams.set(
                index === 0 ? URL_PARAMS.STOP : `${URL_PARAMS.STOP}${index + 1}`,
                stop.stopName
            );
            if (stop.vehicleNumbers.length > 0) {
                newUrl.searchParams.set(
                    index === 0 ? URL_PARAMS.NUMBERS : `${URL_PARAMS.NUMBERS}${index + 1}`,
                    stop.vehicleNumbers.join(",")
                );
            } else {
                newUrl.searchParams.delete(index === 0 ? URL_PARAMS.NUMBERS : `${URL_PARAMS.NUMBERS}${index + 1}`);
            }
        });
        newUrl.searchParams.set(URL_PARAMS.UNINTERACTIVE, "true");
    } else {
        const stopName = document.getElementById("stop-name").value.trim();
        const vehicleNumbers = document.getElementById("vehicle-numbers").value.trim();
        if (stopName) {
            newUrl.searchParams.set(URL_PARAMS.STOP, stopName);
        } else {
            newUrl.searchParams.delete(URL_PARAMS.STOP);
        }
        if (vehicleNumbers) {
            newUrl.searchParams.set(URL_PARAMS.NUMBERS, vehicleNumbers);
        } else {
            newUrl.searchParams.delete(URL_PARAMS.NUMBERS);
        }
        newUrl.searchParams.delete(URL_PARAMS.UNINTERACTIVE);
    }
    window.history.replaceState({}, "", newUrl);
}
async function suggestStops(query) {
    const suggestionsContainer = document.getElementById("stop-suggestions");
    if (!query.trim()) {
        suggestionsContainer.style.display = "none";
        return;
    }
    try {
        const locationResponse = await fetch(API_ENDPOINTS.LOCATIONS + "?query=" + encodeURIComponent(query) + "&type=station");
        const locationData = await locationResponse.json();
        if (!locationData.stations || locationData.stations.length === 0) {
            suggestionsContainer.style.display = "none";
            return;
        }
        const uniqueStations = Array.from(new Set(locationData.stations.map(station => station.name)))
            .map(name => locationData.stations.find(station => station.name === name));
        const validStations = [];
        for (const station of uniqueStations) {
            let fullName = await getFullStopName(station.name);
            if (await checkIfTPG(fullName)) {
                const stationObj = await getStopId(fullName);
                if (stationObj && !validStations.some(s => s.id === stationObj.id)) {
                    validStations.push({id: stationObj.id, name: stationObj.name});
                }
            }
        }
        const suggestions = validStations.slice(0, UI_CONFIG.SUGGESTIONS_LIMIT);
        suggestionsContainer.innerHTML = "";
        suggestions.forEach(station => {
            const div = document.createElement("div");
            div.className = "stop-suggestion";
            div.textContent = station.name;
            div.addEventListener("click", () => selectSuggestion(station));
            suggestionsContainer.appendChild(div);
        });
        suggestionsContainer.style.display = "block";
    } catch (error) {
        suggestionsContainer.style.display = "none";
    }
}
async function selectSuggestion(station) {
    if (!station || !station.name) return;
    const stopNameInput = document.getElementById("stop-name");
    const suggestionsContainer = document.getElementById("stop-suggestions");
    stopNameInput.value = station.name;
    document.getElementById("stop-name-header").textContent = (language === UI_CONFIG.LANGUAGES.EN ? "Stop: " : "Arrêt : ") + station.name;
    suggestionsContainer.style.display = "none";
    userSelectedStop = true;
    const currentUrl = new URL(window.location);
    currentUrl.searchParams.set(URL_PARAMS.STOP, station.name);
    window.history.replaceState({}, "", currentUrl);
    updateURLParams();
    await fetchAndDisplayBusInfo();
}
function updateSelectedSuggestion() {
    const suggestions = document.querySelectorAll(".stop-suggestion")
    suggestions.forEach((suggestion, index) => {
        if (index === selectedSuggestionIndex) {
            suggestion.classList.add("selected")
            suggestion.scrollIntoView({ block: "nearest" })
        } else {
            suggestion.classList.remove("selected")
        }
    })
}
document.getElementById("stop-name").addEventListener("keydown", function(e) {
    const suggestionsContainer = document.getElementById("stop-suggestions");
    const suggestions = suggestionsContainer.querySelectorAll(".stop-suggestion");
    const isVisible = suggestionsContainer.style.display === "block";

    if (!isVisible) return;

    switch (e.key) {
        case "ArrowDown":
            e.preventDefault();
            selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, suggestions.length - 1);
            updateSelectedSuggestion();
            break;
        case "ArrowUp":
            e.preventDefault();
            selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, 0);
            updateSelectedSuggestion();
            break;
        case "Enter":
            e.preventDefault();
            if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
                selectSuggestion(suggestedStops[selectedSuggestionIndex]);
                selectedSuggestionIndex = -1;
            }
            break;
        case "Escape":
            suggestionsContainer.style.display = "none";
            suggestionsContainer.innerHTML = "";
            selectedSuggestionIndex = -1;
            break;
    }
});
document.getElementById("stop-name").addEventListener("input", function() {
    selectedSuggestionIndex = -1;
    clearTimeout(debounceTimeout);
    const query = this.value;
    userSelectedStop = false;
    const currentUrl = new URL(window.location);
    if(query.trim().length > 0){
        currentUrl.searchParams.set(URL_PARAMS.STOP, query);
    } else {
        currentUrl.searchParams.delete(URL_PARAMS.STOP);
        document.getElementById("stop-suggestions").style.display = "none";
    }
    window.history.replaceState({}, "", currentUrl);
    updateURLParams();
    debounceTimeout = setTimeout(() => {
        if(query.trim().length > 0){
            suggestStops(query);
        }
        fetchAndDisplayBusInfo();
    }, TIME_CONFIG.DEBOUNCE_DELAY);
});
document.getElementById("vehicle-numbers").addEventListener("input", function() {
    clearTimeout(debounceTimeout);
    updateURLParams();
    debounceTimeout = setTimeout(() => {
        fetchAndDisplayBusInfo();
    }, TIME_CONFIG.DEBOUNCE_DELAY);
});
async function autofillStopNameFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const requiredElements = ["language-switch", "language-label", "time-format-switch", "stop-name", "stop-name-header", "vehicle-numbers", "bus-form"];
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    if (missingElements.length > 0) return;
    clearAllTimers();
    darkMode = urlParams.get(URL_PARAMS.DARK_MODE) === "true";
    localStorage.setItem(URL_PARAMS.DARK_MODE, darkMode);
    updateDarkMode();
    language = urlParams.get(URL_PARAMS.LANGUAGE) === UI_CONFIG.LANGUAGES.FR ? UI_CONFIG.LANGUAGES.FR : UI_CONFIG.LANGUAGES.EN;
    document.getElementById("language-switch").checked = language === UI_CONFIG.LANGUAGES.FR;
    document.getElementById("language-label").textContent = language.toUpperCase();
    updateLanguage();
    const timeFormatParam = urlParams.get(URL_PARAMS.TIME_FORMAT);
    if (timeFormatParam === "minutes" || timeFormatParam === "time") {
        timeFormat = timeFormatParam;
        localStorage.setItem("timeFormat", timeFormat);
    }
    updateTimeFormatUI();
    uninteractiveMode = urlParams.get(URL_PARAMS.UNINTERACTIVE) === "true";
    stops = [];
    if (uninteractiveMode) {
        const stopName = urlParams.get(URL_PARAMS.STOP);
        const busNumbersParam = urlParams.get(URL_PARAMS.NUMBERS);
        if (stopName) {
            const decodedStopName = decodeURIComponent(stopName);
            const vehicleNumbers = busNumbersParam ? busNumbersParam.split(",").map(num => num.trim()) : [];
            stops.push({ stopName: decodedStopName, vehicleNumbers });
            let index = 2;
            while (urlParams.has(`${URL_PARAMS.STOP}${index}`)) {
                const nextStopName = urlParams.get(`${URL_PARAMS.STOP}${index}`);
                const nextBusNumbersParam = urlParams.get(`${URL_PARAMS.NUMBERS}${index}`);
                const nextVehicleNumbers = nextBusNumbersParam ? nextBusNumbersParam.split(",").map(num => num.trim()) : [];
                stops.push({ stopName: decodeURIComponent(nextStopName), vehicleNumbers: nextVehicleNumbers });
                index++;
            }
            showUninteractiveModeUI();
            startUninteractiveMode();
        }
    } else {
        const stopName = urlParams.get(URL_PARAMS.STOP);
        const vehicleNumbersParam = urlParams.get(URL_PARAMS.NUMBERS);
        if (stopName) {
            const decodedStopName = decodeURIComponent(stopName);
            const stopNameInput = document.getElementById("stop-name");
            stopNameInput.value = decodedStopName;
            document.getElementById("stop-name-header").textContent = (language === UI_CONFIG.LANGUAGES.EN ? "Stop: " : "Arrêt : ") + decodedStopName;
            userSelectedStop = true;
        }
        if (vehicleNumbersParam) {
            document.getElementById("vehicle-numbers").value = decodeURIComponent(vehicleNumbersParam);
        }
        showNormalModeUI();
        if (stopName) {
            startNormalMode();
        }
    }
}
function scheduleRefresh(fetchAndUpdate, interval) {
    const now = new Date()
    const step = interval / 1000
    const nowSeconds = now.getSeconds() + now.getMilliseconds() / 1000
    let delay = Math.ceil(nowSeconds / step) * step - nowSeconds
    delay = delay * 1000
    if (delay < 1) delay = interval
    setTimeout(async () => {
        await fetchAndUpdate()
        scheduleRefresh(fetchAndUpdate, interval)
    }, delay)
    const nextRefresh = new Date(now.getTime() + delay)
    debugLog("Next refresh scheduled for " + nextRefresh.toLocaleTimeString("en-GB", {hour:"2-digit", minute:"2-digit", second:"2-digit"}), true)
}
function startUninteractiveMode() {
    clearAllTimers()
    refreshCountdown = TIME_CONFIG.REFRESH_INTERVALS.UNINTERACTIVE_MODE / 1000
    const fetchAndUpdate = async () => {
        try {
            await fetchAndDisplayCurrentStop()
            refreshCountdown = TIME_CONFIG.REFRESH_INTERVALS.UNINTERACTIVE_MODE / 1000
            debugLog("Data refresh complete, next update in " +
                TIME_CONFIG.REFRESH_INTERVALS.UNINTERACTIVE_MODE / 1000 + "s", true)
        } catch(error){}
    }
    fetchAndUpdate()
    scheduleRefresh(fetchAndUpdate, TIME_CONFIG.REFRESH_INTERVALS.UNINTERACTIVE_MODE)
    countdownInterval = setInterval(() => {
        refreshCountdown--
        if (window.currentBuses) {
            const now = moment().tz(TIME_CONFIG.TIMEZONE)
            const updatedBuses = window.currentBuses
                .map(bus => ({
                    ...bus,
                    minutesUntilDeparture: Math.ceil(moment.duration(bus.departure.diff(now)).asMinutes())
                }))
            updateDisplayWithFormat(updatedBuses)
        }
    }, TIME_CONFIG.REFRESH_INTERVALS.COUNTDOWN)
}
function startNormalMode() {
    debugLog("Starting normal mode")
    clearAllTimers()
    const fetchAndUpdate = async () => {
        debugLog("Fetching new data in normal mode at " + new Date().toLocaleTimeString("en-GB", {hour: "2-digit", minute: "2-digit"}))
        await fetchAndDisplayBusInfo()
        debugLog("Data refresh complete, next update in " +
            TIME_CONFIG.REFRESH_INTERVALS.NORMAL_MODE / 1000 + "s", true)
    }
    fetchAndUpdate()
    scheduleRefresh(fetchAndUpdate, TIME_CONFIG.REFRESH_INTERVALS.NORMAL_MODE)
    countdownInterval = setInterval(() => {
        if (window.currentBuses) {
            const now = moment().tz(TIME_CONFIG.TIMEZONE)
            const updatedBuses = window.currentBuses
                .map(bus => ({
                    ...bus,
                    minutesUntilDeparture: Math.ceil(moment.duration(bus.departure.diff(now)).asMinutes())
                }))
        }
    }, TIME_CONFIG.REFRESH_INTERVALS.COUNTDOWN)
}
function getCurrentStopName() {
    return uninteractiveMode
        ? (stops[currentStopIndex]?.stopName || "").trim()
        : document.getElementById("stop-name").value.trim()
}
function updateStopNameHeader() {
    const header = document.getElementById("stop-name-header")
    if (!header) return
    if (uninteractiveMode) {
        const currentStop = stops[currentStopIndex]
        const stopName = currentStop ? currentStop.stopName : ""
        header.textContent =
            (language === UI_CONFIG.LANGUAGES.EN ? "Stop: " : "Arrêt : ") +
            (stopName || "")
        header.style.display = "block"
    } else {
        header.style.display = "none"
    }
}
async function fetchAndDisplayCurrentStop() {
    debugLog("Entering fetchAndDisplayCurrentStop");
    const stop = stops[currentStopIndex];
    if (!stop) return;
    const header = document.getElementById("stop-name-header");
    const busInfo = document.getElementById("bus-info");
    const stopNameInput = document.getElementById("stop-name");
    const vehicleNumbersInput = document.getElementById("vehicle-numbers");
    if (!header || !busInfo || !stopNameInput || !vehicleNumbersInput) return;
    if (!uninteractiveMode) {
        stopNameInput.value = stop.stopName;
        vehicleNumbersInput.value = stop.vehicleNumbers.join(", ");
    }
    try {
        const formattedStopName = await getFullStopName(stop.stopName);
        const locationResponse = await fetch(API_ENDPOINTS.LOCATIONS + "?query=" + encodeURIComponent(formattedStopName) + "&type=station");
        const locationData = await locationResponse.json();
        if (locationData.stations && locationData.stations.length > 0) {
            const station = locationData.stations.find(s => s.name.toLowerCase() === formattedStopName.toLowerCase());
            if (station && uninteractiveMode) {
                stops[currentStopIndex].stopName = station.name;
                updateStopNameHeader();
            }
        }
    } catch (error) {}
    await fetchAndDisplayBusInfo();
}
function showUninteractiveModeUI() {
    const container = document.querySelector(".container");
    const busForm = document.getElementById("bus-form");
    const readmeButton = document.getElementById("readme-button");
    if (!container || !busForm || !readmeButton) return;
    document.getElementById("bus-info").innerHTML = "";
    document.body.classList.add("uninteractive-mode");
    container.classList.add("uninteractive-mode");
    busForm.style.display = "none";
    updateStopNameHeader();
    readmeButton.style.display = "none";
}
function showNormalModeUI() {
    document.body.classList.remove("uninteractive-mode")
    document.querySelector(".container").classList.remove("uninteractive-mode")
    document.getElementById("bus-form").style.display = "flex"
    const header = document.getElementById("stop-name-header")
    const stopName = document.getElementById("stop-name").value.trim()
    header.classList.remove("fade-in", "fade-out")
    header.style.display = "none"
    document.getElementById("readme-button").style.display = "flex"
}
function toggleDarkMode() {
    const themeToggle = document.getElementById("theme-toggle")
    themeToggle.classList.add("rotate")
    setTimeout(() => {
        darkMode = !darkMode
        localStorage.setItem(URL_PARAMS.DARK_MODE, darkMode)
        updateDarkMode()
        updateURLParams()
        themeToggle.classList.remove("rotate")
    }, TIME_CONFIG.ANIMATION_DELAYS.FADE)
}
function updateDarkMode() {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light")
    document.getElementById("theme-toggle").textContent = darkMode ? "🌙" : "☀️"
    localStorage.setItem("darkMode", darkMode)
}
function exitUninteractiveMode() {
    const lastStopName = getCurrentStopName()
    uninteractiveMode = false
    stops = []
    currentStopIndex = 0
    clearAllTimers()
    updateStopNameHeader()
    showNormalModeUI()
    const currentUrl = new URL(window.location)
    currentUrl.searchParams.delete(URL_PARAMS.UNINTERACTIVE)
    for (let i = 2; i <= 10; i++) {
        currentUrl.searchParams.delete(`${URL_PARAMS.STOP}${i}`)
        currentUrl.searchParams.delete(`${URL_PARAMS.NUMBERS}${i}`)
    }
    window.history.pushState({}, "", currentUrl)
    if (lastStopName) {
        document.getElementById("stop-name").value = lastStopName
        startNormalMode()
    }
}
function updateLanguage() {
    const elements = {
        "main-title": {
            en: "TPG Bus and Tram Timings",
            fr: "Horaires des bus et trams TPG"
        },
        "stop-name": {
            en: "Enter stop name",
            fr: "Entrez le nom de l'arrêt"
        },
        "vehicle-numbers": {
            en: "Enter bus/tram numbers (optional)",
            fr: "Entrez les numéros de bus/tram (facultatif)"
        },
        "readme-button": {
            en: "📖 Read Me",
            fr: "📖 Lire Moi"
        },
        "stop-name-header": {
            en: "Stop: ",
            fr: "Arrêt : "
        }
    }
    for (let id in elements) {
        const element = document.getElementById(id)
        if (element) {
            if (element.tagName === "INPUT") {
                element.placeholder = elements[id][language]
            } else if (id === "stop-name-header" && element.textContent) {
                const currentStop = element.textContent.split(": ")[1]
                element.textContent = elements[id][language] + (currentStop || "")
            } else {
                element.textContent = elements[id][language]
            }
        }
    }
    localStorage.setItem("language", language)
}
function getReadmeContent() {
    if (language === "en") {
        return `
            <div class="readme-body">
                <h2>TPG Bus and Tram Timings</h2>
                <p class="readme-description">Get real-time schedules for Geneva's public transport system (TPG) with an easy-to-use interface.</p>
                <div class="feature-grid">
                    <div class="feature-card">
                        <h4>🔍 Smart Search</h4>
                        <p>Type any stop name and get instant suggestions with our intelligent autocomplete.</p>
                    </div>
                    <div class="feature-card">
                        <h4>🌓 Dark Mode</h4>
                        <p>Easy on your eyes with automatic theme persistence and smooth transitions.</p>
                    </div>
                    <div class="feature-card">
                        <h4>🌍 Bilingual</h4>
                        <p>Switch seamlessly between English and French interfaces.</p>
                    </div>
                    <div class="feature-card">
                        <h4>📍 Location Detection</h4>
                        <p>Click the location button to find and select your nearest public transport stop automatically.</p>
                    </div>
                    <div class="feature-card">
                        <h4>🚌 Real-time Updates</h4>
                        <p>All transport data is provided in real-time by the TPG API. Times are shown in minutes until departure and automatically update.</p>
                    </div>
                </div>
                <h3>Quick Start Guide</h3>
                <ol>
                    <li><strong>Find Your Stop:</strong> Start typing the stop name in the search box - suggestions will appear automatically.</li>
                    <li><strong>Filter Routes (Optional):</strong> Enter specific bus/tram numbers separated by commas (ex: "12, 18").</li>
                    <li><strong>View Departures:</strong> Click on any bus/tram number to see detailed departure times for all directions.</li>
                </ol>
                <h3>Pro Tips</h3>
                <ul>
                    <li><strong>Quick Theme Switch:</strong> Click the sun/moon icon to toggle between light and dark modes.</li>
                    <li><strong>Language Toggle:</strong> Use the switch in the top-right corner to change between EN/FR.</li>
                    <li><strong>Modal Navigation:</strong> Press <span class="shortcut-key">ESC</span> or click outside to close a modal window.</li>
                    <li><strong>Multiple Routes:</strong> Enter multiple bus numbers like "12, 18" to filter specific routes.</li>
                    <li><strong>Mode Non Interactif:</strong> Press <span class="shortcut-key">Shift + K</span> to toggle between interactive and non interactive modes.</li>
                </ul>
                <h3>URL Parameters</h3>
                <p>You can use URL parameters to pre-configure the application:</p>
                <ul>
                    <li><strong>Single Stop:</strong></li>
                    <li><span class="shortcut-key">?stop=Gare Cornavin&numbers=12,17,18</span></li>
                </ul>
                <p>For uninteractive mode with multiple stops:</p>
                <ul>
                    <li>Format:</li>
                    <li><span class="shortcut-key">?stop=Gare Cornavin&numbers=10,18&stop2=Bel-Air&numbers2=14,17&uninteractive=true</span></li>
                    <li>Exit uninteractive mode: Press <span class="shortcut-key">Shift + K</span></li>
                </ul>
                <h3>About TPG Data</h3>
                <p>All transport data is provided in real-time by the TPG API. Times are shown in minutes until departure and automatically update.</p>
            </div>
        `
    } else {
        return `
            <div class="readme-body">
                <h2>Horaires des bus et trams TPG</h2>
                <p class="readme-description">Obtenz les horaires en temps réel du système de transport public genevois (TPG) avec une interface facile à utiliser.</p>
                <div class="feature-grid">
                    <div class="feature-card">
                        <h4>🔍 Recherche Intelligente</h4>
                        <p>Tapez le nom d'un arrêt et obtenez des suggestions instantanées avec notre autocomplétion intelligente.</p>
                    </div>
                    <div class="feature-card">
                        <h4>🌓 Mode Sombre</h4>
                        <p>Agréable pour vos yeux avec persistance automatique du thème et transitions fluides.</p>
                    </div>
                    <div class="feature-card">
                        <h4>🌍 Bilingue</h4>
                        <p>Basculez facilement entre les interfaces en anglais et en français.</p>
                    </div>
                    <div class="feature-card">
                        <h4>📍 Détection de Localisation</h4>
                        <p>Cliquez sur le bouton de localisation pour trouver et sélectionner automatiquement l'arrêt de transport public le plus proche.</p>
                    </div>
                    <div class="feature-card">
                        <h4>🚌 Mises à jour en temps réel</h4>
                        <p>Toutes les données de transport sont fournies en temps réel par l'API TPG. Les temps affichés indiquent les minutes jusqu'au départ et se mettent à jour automatiquement.</p>
                    </div>
                </div>
                <h3>Guide de Démarrage Rapide</h3>
                <ol>
                    <li><strong>Trouvez Votre Arrêt :</strong> Commencez à taper le nom de l'arrêt dans la barre de recherche - les suggestions apparaîtront automatiquement.</li>
                    <li><strong>Filtrer les Lignes (Optionnel) :</strong> Entrez les numéros de bus/tram séparés par des virgules (ex: "12, 18").</li>
                    <li><strong>Voir les Départs :</strong> Cliquez sur un numéro de bus/tram pour voir les horaires détaillés de départ.</li>
                </ol>
                <h3>Astuces Pro</h3>
                <ul>
                    <li><strong>Changement de Thème Rapide :</strong> Cliquez sur l'icône soleil/lune pour basculer entre les modes clair et sombre.</li>
                    <li><strong>Language Toggle:</strong> Utilisez le commutateur en haut à droite pour changer entre EN/FR.</li>
                    <li><strong>Navigation Modale :</strong> Appuyez sur <span class="shortcut-key">ESC</span> ou cliquez à l'extérieur pour fermer une fenêtre modale.</li>
                    <li><strong>Lignes Multiples :</strong> Entrez plusieurs numéros de bus comme "12, 18" pour filtrer des lignes spécifiques.</li>
                    <li><strong>Mode Non Interactif :</strong> Appuyez sur <span class="shortcut-key">Shift + K</span> pour basculer entre les modes interactif et non interactif.</li>
                </ul>
                <h3>Paramètres URL</h3>
                <p>Vous pouvez utiliser des paramètres URL pour préconfigurer l'application :</p>
                <ul>
                    <li><strong>Arrêt Unique:</strong></li>
                    <li><span class="shortcut-key">?stop=Gare Cornavin&numbers=12,17,18</span></li>
                </ul>
                <p>Pour le mode non interactif avec plusieurs arrêts :</p>
                <ul>
                    <li>Format:</li>
                    <li><span class="shortcut-key">?stop=Gare Cornavin&numbers=10,18&stop2=Bel-Air&numbers2=14,17&uninteractive=true</span></li>
                    <li>Quitter le mode non interactif: Appuyez sur <span class="shortcut-key">Shift + K</span></li>
                </ul>
                <h3>À propos des données TPG</h3>
                <p>Toutes les données de transport sont fournies en temps réel par l'API TPG. Les temps affichés indiquent les minutes jusqu'au départ et se mettent à jour automatiquement.</p>
            </div>
        `
    }
}
function updateDisplayWithFormat(buses) {
    if (!buses) return
    window.currentBuses = buses
    if (document.getElementById("popup-modal").style.display === "flex") {
        const currentBusKey = document.querySelector("#modal-body h2")?.textContent
        if (currentBusKey) {
            const currentBusDetails = buses.filter(
                bus => `${bus.vehicleType} ${bus.busNumber}` === currentBusKey
            )
            if (currentBusDetails.length > 0) {
                displayModal(currentBusDetails)
            }
        }
    }
    if (uninteractiveMode) {
        displayBusesUninteractiveMode(buses)
    } else {
        displayBusInfo(buses)
    }
}
function timeFormatSwitchHandler() {
    timeFormat = this.checked ? "minutes" : "time"
    localStorage.setItem("timeFormat", timeFormat)
    updateTimeFormatUI()
    updateURLParams()
    updateDisplayWithFormat(window.currentBuses)
}
async function fetchAndDisplayBusInfo() {
    if (isFetching) return;
    isFetching = true;
    try {
        const stopName = getCurrentStopName();
        const urlParams = new URLSearchParams(window.location.search);
        const numbersFromUrl = urlParams.get("numbers");
        let vehicleNumbers;
        if(numbersFromUrl){
            vehicleNumbers = numbersFromUrl.split(",").map(num => num.trim());
        }else if(uninteractiveMode){
            vehicleNumbers = stops[currentStopIndex].vehicleNumbers;
        }else{
            const vehicleNumbersInput = document.getElementById("vehicle-numbers").value.trim();
            vehicleNumbers = vehicleNumbersInput ? vehicleNumbersInput.split(",").map(num => num.trim()) : [];
        }
        const timeZone = TIME_CONFIG.TIMEZONE;
        if (!stopName) {
            displayMessage(language === "en" ? "Please enter a stop name." : "Veuillez entrer un nom d'arrêt.");
            return;
        }
        if (!(await checkIfTPG(stopName))) {
            displayMessage(language === "en" ? "No upcoming buses or trams departing from \"" + stopName + "\" were found." : "Aucun bus ou tram au départ de \"" + stopName + "\" n'a été trouvé.");
            isFetching = false;
            return;
        }
        const formattedStopName = await getFullStopName(stopName);
        const stationObj = await getStopId(formattedStopName);
        if (!stationObj) {
            displayMessage(language === "en" ? "No upcoming buses or trams departing from \"" + stopName + "\" were found." : "Aucun bus ou tram au départ de \"" + stopName + "\" n'a été trouvé.");
            return;
        }
        if (uninteractiveMode) {
            stops[currentStopIndex].stopName = stationObj.name;
        }
        document.getElementById("stop-name-header").textContent = (language === "en" ? "Stop: " : "Arrêt : ") + stationObj.name;
        const stationboardUrl = API_ENDPOINTS.STATIONBOARD + "?stop=" + encodeURIComponent(stopName) + "&limit=300&show_delays=1&transportation_types=tram,bus&mode=depart";
        const response = await fetch(stationboardUrl);
        const data = await response.json();
        
        if (!data || !data.connections || !Array.isArray(data.connections)) {
            displayMessage(language === "en" ? "No upcoming buses or trams found." : "Aucun bus ou tram à venir n'a été trouvé.");
            return;
        }

        const now = moment().tz(timeZone);
        const busesList = data.connections.map(function(connection){
            if (!connection || !connection.time || !connection.terminal || !connection.terminal.name) {
                return null;
            }
            let timeStr = connection.time.toLowerCase().replace("é", "e");
            let isDepart = timeStr.includes("depart");
            const departure = isDepart ? moment() : moment.tz(connection.time, TIME_CONFIG.TIMEZONE);
            const minutesUntilDeparture = Math.ceil(moment.duration(departure.diff(now)).asMinutes());
            return {
                vehicleType: connection.type === "tram" ? "Tram" : "Bus",
                busNumber: connection.line,
                to: connection.terminal.name,
                departure: departure,
                minutesUntilDeparture: minutesUntilDeparture,
                isDepart: isDepart,
                bgColor: connection.color && connection.color.includes("~") ? (function(){let p = connection.color.split("~"); return p[0].trim() ? "#" + p[0].trim() : "#FF6600";})() : "#FF6600",
                txtColor: connection.color && connection.color.includes("~") ? (function(){let p = connection.color.split("~"); return p[1].trim() ? "#" + p[1].trim() : "#FFFFFF";})() : "#FFFFFF"
            };
        }).filter(bus => bus !== null);

        if (busesList.length === 0) {
            displayMessage(language === "en" ? "No upcoming buses or trams found." : "Aucun bus ou tram à venir n'a été trouvé.");
            return;
        }

        let filteredBuses = busesList;
        if(vehicleNumbers.length > 0){
            filteredBuses = busesList.filter(function(bus){
                return vehicleNumbers.some(num => num.toLowerCase() === String(bus.busNumber).toLowerCase());
            });
        }

        if (filteredBuses.length === 0) {
            displayMessage(language === "en" ? "No buses or trams found for the specified numbers." : "Aucun bus ou tram trouvé pour les numéros spécifiés.");
            return;
        }

        window.currentBuses = filteredBuses;
        if(uninteractiveMode){
            displayBusesUninteractiveMode(filteredBuses);
        }else{
            displayBusInfo(filteredBuses);
        }
    } catch (error) {
        displayMessage(language === "en" ? "An error occurred while fetching bus or tram information." : "Une erreur s'est produite lors de la récupération des informations de bus ou de tram.");
    } finally {
        isFetching = false;
    }
}
function formatDeparture(bus) {
    if (!bus.departure) {
        var el = document.createElement("span");
        el.textContent = "Unknown";
        return el;
    }
    if (bus.isDepart) {
        var el = document.createElement("span");
        el.textContent = language === "en" ? "Leaving" : "Départ";
        return el;
    }
    var diff = bus.minutesUntilDeparture;
    if (diff < 0) {
        var container = document.createElement("div");
        container.className = "departure-warning";
        var minutesSpan = document.createElement("span");
        minutesSpan.className = "minutes";
        minutesSpan.textContent = Math.abs(diff) + " min";
        var warningSpan = document.createElement("span");
        warningSpan.className = "warning";
        warningSpan.textContent = language === "en" ? "⚠️ LATE" : "⚠️ RETARD";
        container.appendChild(minutesSpan);
        container.appendChild(warningSpan);
        return container;
    }
    if (diff === 0) {
        var el = document.createElement("span");
        el.textContent = language === "en" ? "At Stop" : "À l'arrêt";
        return el;
    }
    if (timeFormat === "time") {
        var el = document.createElement("span");
        el.textContent = bus.departure.format("HH:mm");
        return el;
    }
    var el = document.createElement("span");
    el.textContent = diff + (language === "en" ? " min" : " min");
    return el;
}
function displayBusesUninteractiveMode(buses) {
    const header = document.getElementById("stop-name-header");
    header.style.display = "block";
    const busInfoContainer = document.getElementById("bus-info");
    if (!busInfoContainer) return;
    busInfoContainer.innerHTML = "";
    const gridContainer = document.createElement("div");
    gridContainer.classList.add("grid-container");
    const busGroups = {};
    buses.forEach(bus => {
        const key = `${bus.vehicleType} ${bus.busNumber}`;
        if (!busGroups[key]) {
            busGroups[key] = {};
        }
        if (!busGroups[key][bus.to]) {
            busGroups[key][bus.to] = [];
        }
        busGroups[key][bus.to].push(bus);
    });
    Object.entries(busGroups)
        .sort()
        .forEach(([busKey, directions]) => {
            const bigBox = document.createElement("div");
            bigBox.classList.add("big-box");
            const firstDirectionKey = Object.keys(directions)[0];
            const firstBus = directions[firstDirectionKey][0];
            bigBox.style.border = "3px solid " + firstBus.bgColor;
            bigBox.style.backgroundColor = "transparent";
            const busInfo = document.createElement("div");
            busInfo.classList.add("bus-info");
            busInfo.textContent = busKey;
            bigBox.appendChild(busInfo);
            Object.entries(directions)
                .sort()
                .forEach(([direction, busList]) => {
                    const directionHeader = document.createElement("h3");
                    directionHeader.textContent = (language === "en" ? "To: " : "Vers : ") + direction;
                    bigBox.appendChild(directionHeader);
                    const timeGrid = document.createElement("div");
                    timeGrid.classList.add("time-grid");
                    timeGrid.style.display = "grid";
                    timeGrid.style.gridTemplateColumns = "repeat(2, 1fr)";
                    const maxCells = TIME_CONFIG.MAX_DEPARTURES_SHOWN;
                    const cellsPerRow = 2;
                    const totalRows = Math.ceil(maxCells / cellsPerRow);
                    const totalCells = totalRows * cellsPerRow;
                    busList.slice(0, maxCells).forEach(bus => {
                        const cell = document.createElement("div");
                        cell.classList.add("cell");
                        cell.appendChild(formatDeparture(bus));
                        timeGrid.appendChild(cell);
                    });
                    const remaining = totalCells - Math.min(busList.length, maxCells);
                    for (let i = 0; i < remaining; i++) {
                        const busElement = document.createElement("div");
                        busElement.classList.add("unknown-cell");
                        busElement.textContent = "Unknown";
                        timeGrid.appendChild(busElement);
                    }
                    bigBox.appendChild(timeGrid);
                });
            gridContainer.appendChild(bigBox);
        });
    busInfoContainer.appendChild(gridContainer);
    updateStopNameHeader();
}
async function findNearestStop(latitude, longitude) {
    try {
        const response = await fetch(API_ENDPOINTS.ARRETS_CSV);
        const csvText = await response.text();
        const lines = csvText.split('\n').slice(1);
        let candidate = {distance: Infinity};
        for (const line of lines) {
            const parts = line.split(';');
            if (parts.length < 7) continue;
            let stop = parts[1], municipality = parts[2], coords = parts[5], active = parts[6].trim() === 'Y';
            if (!coords || !stop || !municipality || !active) continue;
            const nums = coords.split(',');
            if (nums.length < 2) continue;
            let latVal = parseFloat(nums[0].trim()), lonVal = parseFloat(nums[1].trim());
            if (!latVal || !lonVal) continue;
            let d = calculateDistance(latitude, longitude, latVal, lonVal);
            if (d < candidate.distance) candidate = {distance: d, stop: stop, municipality: municipality};
        }
        return candidate.stop ? candidate.municipality + ', ' + candidate.stop : null;
    } catch (e) {
        return null;
    }
}
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}
async function detectNearbyStops() {
    if (!navigator.geolocation) {
        displayMessage(language === "en" ? "Geolocation is not supported by this browser." : "La géolocalisation n'est pas supportée par ce navigateur.");
        return;
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
            const response = await fetch(API_ENDPOINTS.LOCATIONS + "?x=" + longitude + "&y=" + latitude + "&limit=20&type=station");
            const data = await response.json();
            if (data.stations && data.stations.length > 0) {
                let validStations = data.stations.filter(s => s.id && s.coordinate && s.coordinate.x && s.coordinate.y);
                if (validStations.length === 0) {
                    displayMessage(language === "en" ? "No valid stops found nearby." : "Aucun arrêt valide trouvé à proximité.");
                    return;
                }
                validStations.sort((a, b) => {
                    const da = calculateDistance(latitude, longitude, a.coordinate.y, a.coordinate.x);
                    const db = calculateDistance(latitude, longitude, b.coordinate.y, b.coordinate.x);
                    return da - db;
                });
                for (let station of validStations) {
                    const verifiedStop = await checkIfTPG(station.name);
                    if (verifiedStop) {
                        const fullName = await getFullStopName(station.name);
                        document.getElementById('stop-name').value = fullName;
                        userSelectedStop = true;
                        updateURLParams();
                        fetchAndDisplayBusInfo();
                        startNormalMode();
                        return;
                    }
                }
                displayMessage(language === "en" ? "No TPG stops found nearby." : "Aucun arrêt TPG trouvé à proximité.");
            } else {
                displayMessage(language === "en" ? "No stops found nearby." : "Aucun arrêt trouvé à proximité.");
            }
        } catch (error) {
            displayMessage(language === "en" ? "Error fetching nearby stops." : "Erreur lors de la récupération des arrêts à proximité.");
        }
    }, (error) => {
        let errorMessage = "";
        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = language === "en" ? "Permission denied. Please allow location access." : "Accès à la localisation refusé.";
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = language === "en" ? "Location information is unavailable." : "Les informations de localisation sont indisponibles.";
                break;
            case error.TIMEOUT:
                errorMessage = language === "en" ? "The request to get your location timed out." : "La requête pour obtenir votre position a expiré.";
                break;
            default:
                errorMessage = language === "en" ? "An unknown error occurred while retrieving your location." : "Une erreur inconnue s'est produite lors de la récupération de votre position.";
        }
        displayMessage(errorMessage);
    });
}
async function checkIfTPG(apiStopName) {
    const csvResponse = await fetch(API_ENDPOINTS.ARRETS_CSV);
    const csvText = await csvResponse.text();
    const lines = csvText.split('\n').slice(1).filter(line => line.trim() !== '');
    const csvStops = lines.map(line => {
        const parts = line.split(';');
        return {
            name: parts[1].trim().toLowerCase(),
            active: parts[6].trim() === 'Y'
        };
    });
    const lowerApi = apiStopName.toLowerCase();
    for (let stop of csvStops) {
        if (stop.active && (lowerApi.includes(stop.name) || stop.name.includes(lowerApi))) {
            return true;
        }
    }
    return false;
}
async function getFullStopName(apiStopName) {
    try {
        const csvResponse = await fetch(API_ENDPOINTS.ARRETS_CSV);
        const csvText = await csvResponse.text();
        const lines = csvText.split('\n').slice(1).filter(line=>line.trim()!=='');
        for(let i=0;i<lines.length;i++){
            const parts = lines[i].split(';');
            if(parts.length<7)continue;
            var stop = parts[1].trim(), municipality = parts[2].trim(), active = parts[6].trim()==='Y';
            if(!stop||!municipality||!active)continue;
            if(apiStopName.toLowerCase().includes(stop.toLowerCase())||stop.toLowerCase().includes(apiStopName.toLowerCase())){
                return municipality+', '+stop;
            }
        }
        return apiStopName;
    } catch(e) {
        return apiStopName;
    }
}
async function getStopId(stopName) {
    const response = await fetch(API_ENDPOINTS.LOCATIONS + "?query=" + encodeURIComponent(stopName) + "&type=station");
    const data = await response.json();
    if (data.stations && data.stations.length > 0) {
        let station = data.stations.find(s => s.name.toLowerCase() === stopName.toLowerCase());
        station = station || data.stations[0];
        return { id: station.id, name: station.name };
    }
    return null;
}
async function fetchNearbyCSVStops(){
    try{
        const pos = await new Promise((resolve,reject)=>{navigator.geolocation.getCurrentPosition(resolve,reject)});
        const { latitude, longitude } = pos.coords;
        const csvResponse = await fetch(API_ENDPOINTS.ARRETS_CSV);
        const csvText = await csvResponse.text();
        const lines = csvText.split('\n').slice(1).filter(line=>line.trim()!=='');
        const candidateStops = lines.map(line=>{
            const parts = line.split(';');
            return {
                fullName: parts[2].trim() + ', ' + parts[1].trim(),
                coords: parts[5].trim(),
                active: parts[6].trim() === 'Y'
            };
        }).filter(stop=>stop.active && stop.coords && stop.fullName);
        candidateStops.forEach(stop=>{
            const nums = stop.coords.split(',');
            if(nums.length < 2)return;
            const csvLat = parseFloat(nums[0].trim());
            const csvLon = parseFloat(nums[1].trim());
            stop.distance = calculateDistance(latitude, longitude, csvLat, csvLon);
        });
        const validCandidates = candidateStops.filter(stop=>typeof stop.distance === 'number');
        validCandidates.sort((a,b)=> a.distance - b.distance);
        const topStops = validCandidates.slice(0,5);
        const formattedStops = await Promise.all(topStops.map(async s => { 
            const stationObj = await getStopId(s.fullName);
            return { ...s, prettyName: stationObj ? stationObj.name : s.fullName };
        }));
        const modal = document.getElementById('popup-modal');
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <h2 class="modal-title">${language === 'en' ? 'Nearby Stops' : 'Arrêts à proximité'}</h2>
            ${formattedStops.map(s => "<div><button class=\"nearby-stop-btn\" onclick=\"validateAndSelectStop('" + s.prettyName.replace(/'/g, "\\'") + "')\">" + s.prettyName + " - " + s.distance.toFixed(2) + " km</button></div>").join("")}
        `;
        modal.style.display = 'flex';
        setTimeout(()=>modal.classList.add('active'),10);
    }catch(e){
        displayMessage(language === 'en' ? 'Error fetching nearby stops.' : 'Erreur lors de la récupération des arrêts à proximité.');
    }
}

async function validateAndSelectStop(candidateName){
    try{
        const response = await fetch(API_ENDPOINTS.LOCATIONS + "?query=" + encodeURIComponent(candidateName) + "&type=station");
        const data = await response.json();
        if(data.stations && data.stations.length > 0){
            const correctName = data.stations[0].name;
            selectNearbyStop(correctName);
        } else {
            selectNearbyStop(candidateName);
        }
    }catch(err){
        selectNearbyStop(candidateName);
    }
}

function selectNearbyStop(stopName){
    document.getElementById('stop-name').value = stopName;
    userSelectedStop = true;
    updateURLParams();
    closeModal(document.getElementById('popup-modal'));
    fetchAndDisplayBusInfo();
}

async function detectNearestCSVStop() {
    try {
        const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        const { latitude, longitude } = pos.coords;
        const csvResponse = await fetch(API_ENDPOINTS.ARRETS_CSV);
        const csvText = await csvResponse.text();
        const lines = csvText.split('\n').slice(1).filter(line => line.trim() !== "");
        const candidateStops = lines.map(line => {
            const parts = line.split(';');
            return {
                fullName: parts[2].trim() + ', ' + parts[1].trim(),
                coords: parts[5].trim(),
                active: parts[6].trim() === 'Y'
            };
        }).filter(stop => stop.active && stop.coords && stop.fullName);
        candidateStops.forEach(stop => {
            const nums = stop.coords.split(',');
            if (nums.length < 2) return;
            const csvLat = parseFloat(nums[0].trim());
            const csvLon = parseFloat(nums[1].trim());
            stop.distance = calculateDistance(latitude, longitude, csvLat, csvLon);
        });
        const validCandidates = candidateStops.filter(stop => typeof stop.distance === 'number');
        validCandidates.sort((a, b) => a.distance - b.distance);
        if (validCandidates.length > 0) {
            const nearest = validCandidates[0];
            try {
                const response = await fetch(API_ENDPOINTS.LOCATIONS + "?query=" + encodeURIComponent(nearest.fullName) + "&type=station");
                const data = await response.json();
                if (data.stations && data.stations.length > 0) {
                    const station = data.stations[0];
                    document.getElementById('stop-name').value = station.name;
                } else {
                    document.getElementById('stop-name').value = nearest.fullName;
                }
            } catch (error) {
                document.getElementById('stop-name').value = nearest.fullName;
            }
            userSelectedStop = true;
            updateURLParams();
            fetchAndDisplayBusInfo();
            startNormalMode();
        } else {
            displayMessage(language === 'en' ? 'No nearby TPG stops found.' : 'Aucun arrêt TPG trouvé à proximité.');
        }
    } catch (e) {
        displayMessage(language === 'en' ? 'Error fetching nearby stops.' : 'Erreur lors de la récupération des arrêts à proximité.');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (initializeApp()) {
        window.devToolsOpened = false;
        detectDevTools();
        updateDevToolsStatus();
        clearAllTimers();
        autofillStopNameFromURL();
        document.getElementById("readme-button").addEventListener("click", function() {
            const readmeModal = document.getElementById("readme-modal");
            const readmeBody = document.getElementById("readme-body");
            readmeBody.innerHTML = getReadmeContent();
            readmeModal.style.display = "flex";
            setTimeout(() => readmeModal.classList.add("active"), 10);
        });
        document.querySelector(".close").addEventListener("click", () =>
            closeModal(document.getElementById("popup-modal"))
        );
        document.querySelector(".close-readme").addEventListener("click", () =>
            closeModal(document.getElementById("readme-modal"))
        );
        document.getElementById("theme-toggle").addEventListener("click", toggleDarkMode);
        const timeFormatSwitch = document.getElementById("time-format-switch");
        if (timeFormatSwitch) {
            timeFormatSwitch.checked = (timeFormat === "minutes");
            timeFormatSwitch.addEventListener("change", timeFormatSwitchHandler);
        }
        const languageSwitch = document.getElementById("language-switch");
        if (languageSwitch) {
            languageSwitch.checked = language === UI_CONFIG.LANGUAGES.FR;
            languageSwitch.addEventListener("change", function() {
                language = this.checked ? UI_CONFIG.LANGUAGES.FR : UI_CONFIG.LANGUAGES.EN;
                document.getElementById("language-label").textContent = language.toUpperCase();
                updateLanguage();
                updateURLParams();
                if (document.getElementById("stop-name").value.trim()) {
                    fetchAndDisplayBusInfo();
                }
            });
        }
        const locationButton = document.getElementById("detect-location-btn");
        if (locationButton) {
            locationButton.addEventListener("click", detectNearestCSVStop);
        }
        document.addEventListener("click", event => {
            const modal = document.getElementById("popup-modal");
            const readmeModal = document.getElementById("readme-modal");
            if (event.target === modal) closeModal(modal);
            if (event.target === readmeModal) closeModal(readmeModal);
            const suggestionsDiv = document.getElementById("stop-suggestions");
            if (!event.target.closest("#stop-suggestions") &&
                !event.target.closest("#stop-name")) {
                suggestionsDiv.style.display = "none";
                suggestionsDiv.innerHTML = "";
            }
        });
        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                closeModal(document.getElementById("popup-modal"));
                closeModal(document.getElementById("readme-modal"));
            }
            if (event.shiftKey && event.key.toLowerCase() === "k") {
                if (uninteractiveMode) {
                    exitUninteractiveMode();
                } else {
                    const stopName = document.getElementById("stop-name").value.trim();
                    const vehicleNumbers = document
                        .getElementById("vehicle-numbers")
                        .value.trim();
                    if (stopName) {
                        stops = [{
                            stopName,
                            vehicleNumbers: vehicleNumbers
                                ? vehicleNumbers.split(",").map(num => num.trim())
                                : []
                        }];
                        uninteractiveMode = true;
                        showUninteractiveModeUI();
                        updateURLParams();
                        startUninteractiveMode();
                    }
                }
            }
        });
        document.getElementById("stop-name").addEventListener("keydown", function(e) {
            if (e.key === "Enter") {
                this.blur();
                document.getElementById("stop-suggestions").style.display = "none";
                e.preventDefault();
            }
        });
        if (!uninteractiveMode && !document.getElementById("stop-name").value.trim()) {
            startNormalMode();
        }
        document.getElementById("location-list-btn").addEventListener("click", function(){fetchNearbyCSVStops()});
    }
});
function displayBusInfo(buses) {
    window.currentBuses = buses
    const busInfoContainer = document.getElementById("bus-info")
    const header = document.getElementById("stop-name-header")
    header.style.display = "none"
    busInfoContainer.innerHTML = ""
    const busInfoWrapper = document.createElement("div")
    busInfoWrapper.classList.add("bus-info-wrapper")
    busInfoWrapper.style.flexWrap = "wrap"
    busInfoWrapper.style.gap = "10px"
    const groupedBuses = buses.reduce((acc, bus) => {
        const key = `${bus.vehicleType} ${bus.busNumber}`
        if (!acc[key]) {
            acc[key] = []
        }
        acc[key].push(bus)
        return acc
    }, {})
    Object.keys(groupedBuses)
        .sort()
        .forEach(busKey => {
            const busElement = document.createElement("div");
            busElement.classList.add("bus-info-item");
            const firstBus = groupedBuses[busKey][0];
            busElement.style.backgroundColor = firstBus.bgColor;
            busElement.style.color = firstBus.txtColor;
            busElement.innerHTML = `<strong>${busKey}</strong>`;
            if (!uninteractiveMode) {
                busElement.addEventListener("click", () => {
                    displayModal(groupedBuses[busKey]);
                });
            }
            busInfoWrapper.appendChild(busElement);
        });
    busInfoContainer.appendChild(busInfoWrapper)
}
function displayModal(busDetails) {
    window.currentModalBusKey = `${busDetails[0].vehicleType} ${busDetails[0].busNumber}`
    const modal = document.getElementById("popup-modal")
    const modalBody = document.getElementById("modal-body")
    modalBody.innerHTML = ""
    const title = document.createElement("h2")
    title.textContent = `${busDetails[0].vehicleType} ${busDetails[0].busNumber}`
    title.style.color = "var(--primary-color)"
    title.style.marginBottom = "20px"
    title.style.textAlign = "center"
    modalBody.appendChild(title)
    const directionsContainer = document.createElement("div")
    directionsContainer.classList.add("directions-container")
    Object.entries(busDetails.reduce((acc, bus) => {
        if (!acc[bus.to]) { acc[bus.to] = [] }
        acc[bus.to].push(bus)
        return acc
    }, {})).sort((a, b) => a[0].localeCompare(b[0])).forEach(([direction, buses]) => {
        const directionColumn = document.createElement("div")
        directionColumn.classList.add("direction-column")
        const directionHeader = document.createElement("h3")
        directionHeader.textContent = (language === "en" ? "To: " : "Vers : ") + direction
        directionColumn.appendChild(directionHeader)
        const busList = document.createElement("ul")
        busList.classList.add("bus-list")
        const maxCells = TIME_CONFIG.MAX_DEPARTURES_SHOWN
        const cellsPerRow = TIME_CONFIG.GRID_CELLS_PER_ROW
        const totalRows = Math.ceil(maxCells / cellsPerRow)
        const totalCells = totalRows * cellsPerRow
        const sortedBuses = buses.sort((a, b) => a.minutesUntilDeparture - b.minutesUntilDeparture).slice(0, maxCells)
        sortedBuses.forEach(bus => {
            const busItem = document.createElement("li")
            busItem.classList.add("bus-item")
            busItem.appendChild(formatDeparture(bus))
            busList.appendChild(busItem)
        })
        const remaining = totalCells - sortedBuses.length
        for (let i = 0; i < remaining; i++) {
            const listItem = document.createElement("li")
            listItem.classList.add("unknown-cell")
            listItem.textContent = "Unknown"
            busList.appendChild(listItem)
        }
        directionColumn.appendChild(busList)
        directionsContainer.appendChild(directionColumn)
    })
    modalBody.appendChild(directionsContainer)
    modal.style.display = "flex"
    setTimeout(() => modal.classList.add("active"), 10)
}
function displayMessage(message) {
    const busInfoContainer = document.getElementById("bus-info")
    busInfoContainer.innerHTML = ""
    const messageElement = document.createElement("p")
    messageElement.classList.add("message")
    messageElement.textContent = message
    messageElement.style.textAlign = "center"
    messageElement.style.width = "100%"
    messageElement.style.maxWidth = "800px"
    messageElement.style.margin = "20px auto"
    messageElement.style.opacity = "0"
    busInfoContainer.appendChild(messageElement)
    updateStopNameHeader()
}
function updateTimeFormatUI() {
    const timeFormatSwitch = document.getElementById("time-format-switch")
    const timeFormatLabel = document.getElementById("time-format-label")
    if (!timeFormatSwitch || !timeFormatLabel) return
    timeFormatSwitch.checked = timeFormat === "minutes"
    timeFormatLabel.textContent = timeFormat === "time" ? "Time" : "Minutes"
    localStorage.setItem("timeFormat", timeFormat)
}
function initializeApp() {
    try {
        const requiredElements = [
            "language-switch",
            "language-label",
            "time-format-switch",
            "time-format-label",
            "stop-name",
            "stop-name-header",
            "vehicle-numbers",
            "bus-info",
            "theme-toggle"
        ]
        const missingElements = requiredElements.filter(id => !document.getElementById(id))
        if (missingElements.length > 0) return false
        updateDarkMode()
        updateLanguage()
        updateTimeFormatUI()
        setupSwitches()
        return true
    } catch(error) {
        return false
    }
}
function setupSwitches() {
    const timeFormatSwitch = document.getElementById("time-format-switch");
    const languageSwitch = document.getElementById("language-switch");
    if (timeFormatSwitch) {
        timeFormatSwitch.checked = (timeFormat === "minutes");
    }
    if (languageSwitch) {
        languageSwitch.checked = language === UI_CONFIG.LANGUAGES.FR;
    }
}
window.addEventListener("beforeunload", () => {
    clearAllTimers()
    localStorage.setItem(URL_PARAMS.DARK_MODE, darkMode)
    window.devToolsOpened = false
})
window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout)
    debugLog("Resize event detected")
    updateDevToolsStatus()
    resizeTimeout = setTimeout(() => {
        if (uninteractiveMode && !document.hidden && !isDevToolsOpen()) {
            debugLog("Resized window in uninteractive mode")
        }
    }, TIME_CONFIG.ANIMATION_DELAYS.RESIZE)
})
window.addEventListener("visibilitychange", () => {
    debugLog("Visibility changed: " + document.hidden)
    if (document.hidden) {
        debugLog("Hide refresh indicator due to page hidden")
    } else {
        if (!isDevToolsOpen()) {
            debugLog("Page became visible and DevTools are closed")
        }
    }
})
function detectDevTools() {
    setInterval(updateDevToolsStatus, 1000)
}
window.addEventListener("popstate", () => {
    clearAllTimers()
    window.devToolsOpened = false
    refreshCountdown = TIME_CONFIG.REFRESH_INTERVALS.UNINTERACTIVE_MODE / 1000
    autofillStopNameFromURL()
})
function debugLog(message, important = false) {
    if (important) {
        const now = new Date()
        const formattedTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
        console.log("[Debug " + formattedTime + "] " + message)
    }
}
function displayNearbyStops(stops) {
    const modal = document.getElementById("popup-modal");
    const modalBody = document.getElementById("modal-body");
    modalBody.innerHTML = "";
    
    const title = document.createElement("h2");
    title.className = "modal-title";
    title.textContent = language === UI_CONFIG.LANGUAGES.EN ? "Nearby Stops" : "Arrêts à proximité";
    modalBody.appendChild(title);
    
    stops.forEach(stop => {
        const button = document.createElement("button");
        button.className = "nearby-stop-btn";
        
        const nameSpan = document.createElement("span");
        nameSpan.textContent = stop.name;
        
        const distanceSpan = document.createElement("span");
        distanceSpan.className = "distance";
        distanceSpan.textContent = `${Math.round(stop.distance)}m`;
        
        button.appendChild(nameSpan);
        button.appendChild(distanceSpan);
        
        button.addEventListener("click", () => {
            document.getElementById("stop-name").value = stop.name;
            modal.style.display = "none";
            startNormalMode();
        });
        
        modalBody.appendChild(button);
    });
    
    modal.style.display = "block";
}

function fetchAutocomplete(query){return fetch("https://search.ch/timetable/api/completion.fr.json?query="+encodeURIComponent(query)).then(function(response){return response.json();});}
