## iOS Widget

This project ships with a native **Stop Timings** widget that lets you pin upcoming departures for any TPG stop directly to your iPhone Home Screen.

### Selecting a stop
1. Long-press the Home Screen and tap the `+` button to add a new widget.
2. Search for **TPG Stop Timings** and add it to the desired location.
3. After placing the widget, choose **Edit Widget**.
4. Enter the *DIDOC* code of the stop you’d like to monitor (e.g. `TPGN`) and, optionally, a comma-separated list of line numbers to filter (e.g. `12, 18`).

The widget will refresh itself every minute and colour-code the line badge with the official network colour where available.

### Building on device / simulator
Run one of the custom scripts:

```bash
# Development build on the connected iPhone simulator
yarn run:iphone

# Release build & deploy to a connected device
yarn deploy:iphone
```

Both scripts automatically include the widget target thanks to `@bacons/apple-targets`.