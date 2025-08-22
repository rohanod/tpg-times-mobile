import WidgetKit
import SwiftUI

// Define the data structures for the widget
struct Departure: Decodable, Hashable {
    let line: String
    let destination: String
    let minutes: Int
    let color: String
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let departures: [Departure]
}

// The timeline provider for the widget
struct Provider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), departures: [
            Departure(line: "14", destination: "Bernex", minutes: 5, color: "#FF6600"),
            Departure(line: "18", destination: "CERN", minutes: 12, color: "#007AFF"),
        ])
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> SimpleEntry {
        let entry = await getTimelineEntry()
        return entry
    }

    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<SimpleEntry> {
        let entry = await getTimelineEntry()

        // Schedule the next update in 5 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 5, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        return timeline
    }

    private func getTimelineEntry() async -> SimpleEntry {
        let defaults = UserDefaults(suiteName: "group.com.rohanodwyer.tpgtimes")
        var departures: [Departure] = []

        if let savedData = defaults?.data(forKey: "widgetData") {
            let decoder = JSONDecoder()
            if let decodedDepartures = try? decoder.decode([Departure].self, from: savedData) {
                departures = decodedDepartures
            }
        }

        return SimpleEntry(date: Date(), departures: departures)
    }
}

// The SwiftUI view for the widget
struct widgetEntryView : View {
    var entry: Provider.Entry

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            if entry.departures.isEmpty {
                Text("No departures found. Configure the widget in the app.")
                    .font(.system(size: 14))
                    .foregroundColor(.secondary)
                    .padding()
            } else {
                ForEach(entry.departures, id: \.self) { departure in
                    HStack(spacing: 10) {
                        // Colored square with line number
                        Text(departure.line)
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(Color(hex: "#FFFFFF"))
                            .frame(width: 36, height: 24)
                            .background(Color(hex: departure.color))
                            .cornerRadius(4)

                        // Destination
                        Text(departure.destination)
                            .font(.system(size: 15, weight: .medium))
                            .lineLimit(1)

                        Spacer()

                        // Minutes
                        Text("\(departure.minutes) min")
                            .font(.system(size: 15, weight: .bold))
                    }
                    .padding(.vertical, 8)
                    .padding(.horizontal, 12)

                    if departure != entry.departures.last {
                        Divider().background(Color.gray.opacity(0.2))
                    }
                }
            }
            Spacer()
        }
        .padding(.vertical, 4)
    }
}

// The main widget configuration
struct widget: Widget {
    let kind: String = "TPGWidget" // Unique identifier for the widget

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
            widgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("TPG Departures")
        .description("Shows upcoming departures from your favorite stop.")
        .supportedFamilies([.systemMedium])
    }
}

// Helper to convert hex color string to SwiftUI Color
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(.sRGB, red: Double(r) / 255, green: Double(g) / 255, blue: Double(b) / 255, opacity: Double(a) / 255)
    }
}


// Preview for Xcode
#Preview(as: .systemMedium) {
    widget()
} timeline: {
    SimpleEntry(date: .now, departures: [
        Departure(line: "14", destination: "Bernex", minutes: 5, color: "#FF6600"),
        Departure(line: "18", destination: "CERN", minutes: 12, color: "#007AFF"),
        Departure(line: "D", destination: "St-Julien", minutes: 20, color: "#FF0000"),
    ])
}
