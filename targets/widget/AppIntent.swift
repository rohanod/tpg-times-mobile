import WidgetKit
import AppIntents

struct ConfigurationAppIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource { "TPG Departures Widget" }
    static var description: IntentDescription { "Displays upcoming departures from a stop configured in the app." }

    // The configuration is done in the main app, so we don't need any parameters here.
    // The widget will automatically use the settings from the app.
}
