import WidgetKit
import SwiftUI
import AppIntents

// MARK: - Intent Definition

struct SelectStopIntent: AppIntent {
    static var title: LocalizedStringResource = "Select Stop"
    static var description = IntentDescription("Choose a TPG stop to display upcoming departures.")

    @Parameter(title: "Stop DIDOC Code")
    var stopId: String

    @Parameter(title: "Line Numbers (comma-separated)")
    var numbers: String?

    static var parameterSummary: some ParameterSummary {
        Summary("Show departures for \(\.$stopId) filtered by \(\.$numbers)")
    }

    func perform() async throws -> some ProvidesDialog {
        .result(dialog: "Stop updated")
    }
}

// MARK: - Model

struct DepartureInfo: Hashable, Codable {
    let line: String
    let destination: String
    let minutes: Int
    let colorHex: String?
}

struct StopTimingsEntry: TimelineEntry {
    let date: Date
    let stopName: String
    let departures: [DepartureInfo]
}

// MARK: - Timeline Provider

struct StopTimingsProvider: IntentTimelineProvider {
    typealias Intent = SelectStopIntent
    typealias Entry = StopTimingsEntry

    func placeholder(in context: Context) -> StopTimingsEntry {
        StopTimingsEntry(date: Date(), stopName: "Place des Nations", departures: sampleDepartures())
    }

    func getSnapshot(for configuration: SelectStopIntent, in context: Context, completion: @escaping (StopTimingsEntry) -> Void) {
        let entry = StopTimingsEntry(date: Date(), stopName: "Snapshot", departures: sampleDepartures())
        completion(entry)
    }

    func getTimeline(for configuration: SelectStopIntent, in context: Context, completion: @escaping (Timeline<StopTimingsEntry>) -> Void) {
        Task {
            let stopId = configuration.stopId.trimmingCharacters(in: .whitespacesAndNewlines)
            let numbers = configuration.numbers?.split(separator: ",").map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            let (stopName, deps) = await fetchDepartures(stopId: stopId, numberFilters: numbers ?? [])
            let entry = StopTimingsEntry(date: Date(), stopName: stopName, departures: deps)
            // Refresh after 1 minute
            let nextUpdate = Calendar.current.date(byAdding: .minute, value: 1, to: Date()) ?? Date().addingTimeInterval(60)
            let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
            completion(timeline)
        }
    }

    // MARK: Network
    private func fetchDepartures(stopId: String, numberFilters: [Substring]) async -> (String, [DepartureInfo]) {
        guard !stopId.isEmpty else {
            return ("No stop selected", sampleDepartures())
        }

        let urlString = "https://search.ch/timetable/api/stationboard.fr.json?stop=\(stopId)&limit=30&show_delays=1&transportation_types=tram,bus&mode=depart"
        guard let url = URL(string: urlString) else {
            return ("Invalid URL", sampleDepartures())
        }

        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let response = try JSONDecoder().decode(StationboardResponse.self, from: data)
            let stopName = response.stop?.name ?? "Unknown"
            let now = Date()
            let isoFormatter = ISO8601DateFormatter()
            isoFormatter.formatOptions.insert(.withFractionalSeconds)

            let departures = (response.connections ?? []).compactMap { conn -> DepartureInfo? in
                guard let line = conn.line, let destination = conn.terminal?.name, let timeStr = conn.time, let date = isoFormatter.date(from: timeStr) ?? ISO8601DateFormatter().date(from: timeStr) else {
                    return nil
                }
                let minutes = Int(date.timeIntervalSince(now) / 60)
                if minutes < 0 { return nil }
                if !numberFilters.isEmpty && !numberFilters.contains(where: { line.contains($0) }) {
                    return nil
                }
                return DepartureInfo(line: line, destination: destination, minutes: minutes, colorHex: conn.color?.split(separator: "~").first.map { "#\($0)" })
            }.prefix(3).map { $0 }

            return (stopName, Array(departures))
        } catch {
            return ("Error", sampleDepartures())
        }
    }

    private func sampleDepartures() -> [DepartureInfo] {
        [
            DepartureInfo(line: "12", destination: "Carouge", minutes: 5, colorHex: "#FF6600"),
            DepartureInfo(line: "18", destination: "Lancy", minutes: 8, colorHex: "#FF6600"),
            DepartureInfo(line: "3", destination: "Gare Cornavin", minutes: 12, colorHex: "#FF6600")
        ]
    }
}

// MARK: - Widget View

struct StopTimingsWidgetView: View {
    var entry: StopTimingsProvider.Entry

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(entry.stopName)
                .font(.headline)
            ForEach(entry.departures, id: \.self) { dep in
                HStack {
                    Text(dep.line)
                        .font(.subheadline.bold())
                        .foregroundColor(Color(hex: dep.colorHex ?? "#FF6600"))
                        .frame(width: 30, alignment: .leading)
                    Text(dep.destination)
                        .font(.subheadline)
                        .lineLimit(1)
                        .truncationMode(.tail)
                    Spacer()
                    Text("\(dep.minutes)m")
                        .font(.subheadline.monospacedDigit())
                }
            }
            Spacer()
        }
        .padding()
    }
}

// MARK: - Widget Definition

struct StopTimingsWidget: Widget {
    let kind: String = "StopTimingsWidget"

    var body: some WidgetConfiguration {
        IntentConfiguration(kind: kind, intent: SelectStopIntent.self, provider: StopTimingsProvider()) { entry in
            StopTimingsWidgetView(entry: entry)
        }
        .configurationDisplayName("TPG Stop Timings")
        .description("Displays upcoming departures for a selected stop.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Helpers

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int = UInt64()
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
            (a, r, g, b) = (255, 255, 165, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Networking Models

struct StationboardResponse: Decodable {
    struct Connection: Decodable {
        struct Terminal: Decodable { let name: String? }
        let time: String?
        let terminal: Terminal?
        let type: String?
        let line: String?
        let color: String?
        let delay: Int?
    }
    struct StopInfo: Decodable { let name: String? }
    let stop: StopInfo?
    let connections: [Connection]?
}