import WidgetKit
import SwiftUI
import Intents

// MARK: - Configuration Intent
class ConfigurationIntent: INIntent {
    @NSManaged var stopName: String?
    @NSManaged var stopId: String?
    @NSManaged var vehicleFilter: String?
}

// MARK: - Timeline Provider
struct TPGStopProvider: IntentTimelineProvider {
    typealias Entry = TPGStopEntry
    typealias Intent = ConfigurationIntent
    
    func placeholder(in context: Context) -> TPGStopEntry {
        TPGStopEntry(
            date: Date(),
            stopName: "Cornavin",
            stopId: "8587057",
            departures: [
                DepartureInfo(vehicleType: "Tram", number: "12", destination: "Moillesulaz", minutes: 3, color: "#0066CC"),
                DepartureInfo(vehicleType: "Bus", number: "1", destination: "Balexert", minutes: 7, color: "#FF6600"),
                DepartureInfo(vehicleType: "Tram", number: "18", destination: "Carouge-Rondeau", minutes: 12, color: "#009639")
            ],
            vehicleFilter: nil,
            configuration: ConfigurationIntent()
        )
    }
    
    func getSnapshot(for configuration: ConfigurationIntent, in context: Context, completion: @escaping (TPGStopEntry) -> Void) {
        let entry = TPGStopEntry(
            date: Date(),
            stopName: configuration.stopName ?? "Cornavin",
            stopId: configuration.stopId ?? "8587057",
            departures: [
                DepartureInfo(vehicleType: "Tram", number: "12", destination: "Moillesulaz", minutes: 2, color: "#0066CC"),
                DepartureInfo(vehicleType: "Bus", number: "1", destination: "Balexert", minutes: 5, color: "#FF6600")
            ],
            vehicleFilter: configuration.vehicleFilter,
            configuration: configuration
        )
        completion(entry)
    }
    
    func getTimeline(for configuration: ConfigurationIntent, in context: Context, completion: @escaping (Timeline<TPGStopEntry>) -> Void) {
        Task {
            do {
                let departures = await fetchDepartures(
                    stopId: configuration.stopId ?? "8587057",
                    vehicleFilter: configuration.vehicleFilter
                )
                
                let entry = TPGStopEntry(
                    date: Date(),
                    stopName: configuration.stopName ?? "Loading...",
                    stopId: configuration.stopId ?? "",
                    departures: departures,
                    vehicleFilter: configuration.vehicleFilter,
                    configuration: configuration
                )
                
                // Update every 30 seconds
                let nextUpdate = Calendar.current.date(byAdding: .second, value: 30, to: Date()) ?? Date()
                let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
                
                completion(timeline)
            }
        }
    }
    
    private func fetchDepartures(stopId: String, vehicleFilter: String?) async -> [DepartureInfo] {
        guard let url = URL(string: "https://transport.opendata.ch/v1/stationboard?stop=\(stopId)&limit=10&transportation_types=tram,bus&mode=depart") else {
            return []
        }
        
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let response = try JSONDecoder().decode(StationboardResponse.self, from: data)
            
            let formatter = DateFormatter()
            formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ssXXXXX"
            
            let departures = response.connections.compactMap { connection -> DepartureInfo? in
                guard let departureTime = formatter.date(from: connection.time) else { return nil }
                
                let minutes = max(0, Int(departureTime.timeIntervalSinceNow / 60))
                
                // Apply vehicle filter if specified
                if let filter = vehicleFilter, !filter.isEmpty {
                    if !connection.line.contains(filter) {
                        return nil
                    }
                }
                
                return DepartureInfo(
                    vehicleType: connection.type == "tram" ? "Tram" : "Bus",
                    number: connection.line,
                    destination: connection.terminal.name,
                    minutes: minutes,
                    color: connection.color.isEmpty ? "#FF6600" : "#\(connection.color.split(separator: "~")[0])"
                )
            }
            
            return Array(departures.prefix(6)) // Limit to 6 departures for widget display
        } catch {
            print("Error fetching departures: \(error)")
            return []
        }
    }
}

// MARK: - Data Models
struct TPGStopEntry: TimelineEntry {
    let date: Date
    let stopName: String
    let stopId: String
    let departures: [DepartureInfo]
    let vehicleFilter: String?
    let configuration: ConfigurationIntent
}

struct DepartureInfo {
    let vehicleType: String
    let number: String
    let destination: String
    let minutes: Int
    let color: String
}

struct StationboardResponse: Codable {
    let connections: [Connection]
    let stop: Stop
}

struct Connection: Codable {
    let time: String
    let terminal: Terminal
    let type: String
    let line: String
    let color: String
}

struct Terminal: Codable {
    let name: String
}

struct Stop: Codable {
    let name: String
}

// MARK: - Widget Views
struct TPGStopWidgetView: View {
    var entry: TPGStopProvider.Entry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        case .systemLarge:
            LargeWidgetView(entry: entry)
        default:
            SmallWidgetView(entry: entry)
        }
    }
}

struct SmallWidgetView: View {
    let entry: TPGStopProvider.Entry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Image("tpgLogo")
                    .resizable()
                    .frame(width: 20, height: 20)
                Spacer()
                Text(entry.date, style: .time)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            Text(entry.stopName)
                .font(.headline)
                .fontWeight(.bold)
                .lineLimit(1)
                .foregroundColor(Color("text"))
            
            if entry.departures.isEmpty {
                Text("No departures")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
            } else {
                VStack(alignment: .leading, spacing: 2) {
                    ForEach(Array(entry.departures.prefix(3).enumerated()), id: \.offset) { index, departure in
                        HStack {
                            Circle()
                                .fill(Color(hex: departure.color))
                                .frame(width: 8, height: 8)
                            
                            Text(departure.number)
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundColor(Color("text"))
                            
                            Spacer()
                            
                            Text("\(departure.minutes)'")
                                .font(.caption)
                                .fontWeight(.medium)
                                .foregroundColor(Color("text"))
                        }
                    }
                }
            }
            
            Spacer()
        }
        .padding(12)
        .background(Color("background"))
    }
}

struct MediumWidgetView: View {
    let entry: TPGStopProvider.Entry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image("tpgLogo")
                    .resizable()
                    .frame(width: 24, height: 24)
                
                VStack(alignment: .leading) {
                    Text(entry.stopName)
                        .font(.headline)
                        .fontWeight(.bold)
                        .foregroundColor(Color("text"))
                    
                    if let filter = entry.vehicleFilter, !filter.isEmpty {
                        Text("Filter: \(filter)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                Text(entry.date, style: .time)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            if entry.departures.isEmpty {
                Text("No departures found")
                    .font(.body)
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
            } else {
                VStack(alignment: .leading, spacing: 6) {
                    ForEach(Array(entry.departures.prefix(4).enumerated()), id: \.offset) { index, departure in
                        HStack {
                            Circle()
                                .fill(Color(hex: departure.color))
                                .frame(width: 12, height: 12)
                            
                            Text(departure.vehicleType)
                                .font(.caption)
                                .foregroundColor(.secondary)
                                .frame(width: 35, alignment: .leading)
                            
                            Text(departure.number)
                                .font(.body)
                                .fontWeight(.semibold)
                                .foregroundColor(Color("text"))
                                .frame(width: 30, alignment: .leading)
                            
                            Text(departure.destination)
                                .font(.body)
                                .foregroundColor(Color("text"))
                                .lineLimit(1)
                            
                            Spacer()
                            
                            Text("\(departure.minutes) min")
                                .font(.body)
                                .fontWeight(.medium)
                                .foregroundColor(Color("text"))
                        }
                    }
                }
            }
            
            Spacer()
        }
        .padding(16)
        .background(Color("background"))
    }
}

struct LargeWidgetView: View {
    let entry: TPGStopProvider.Entry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image("tpgLogo")
                    .resizable()
                    .frame(width: 32, height: 32)
                
                VStack(alignment: .leading) {
                    Text(entry.stopName)
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(Color("text"))
                    
                    if let filter = entry.vehicleFilter, !filter.isEmpty {
                        Text("Showing vehicles: \(filter)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                VStack(alignment: .trailing) {
                    Text(entry.date, style: .time)
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("Last updated")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
            
            if entry.departures.isEmpty {
                Text("No departures found")
                    .font(.title3)
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
            } else {
                VStack(alignment: .leading, spacing: 8) {
                    ForEach(Array(entry.departures.enumerated()), id: \.offset) { index, departure in
                        HStack {
                            Circle()
                                .fill(Color(hex: departure.color))
                                .frame(width: 16, height: 16)
                            
                            Text(departure.vehicleType)
                                .font(.body)
                                .foregroundColor(.secondary)
                                .frame(width: 45, alignment: .leading)
                            
                            Text(departure.number)
                                .font(.title3)
                                .fontWeight(.semibold)
                                .foregroundColor(Color("text"))
                                .frame(width: 40, alignment: .leading)
                            
                            Text(departure.destination)
                                .font(.body)
                                .foregroundColor(Color("text"))
                                .lineLimit(1)
                            
                            Spacer()
                            
                            Text("\(departure.minutes) min")
                                .font(.title3)
                                .fontWeight(.medium)
                                .foregroundColor(Color("text"))
                        }
                        .padding(.vertical, 2)
                    }
                }
            }
            
            Spacer()
        }
        .padding(20)
        .background(Color("background"))
    }
}

// MARK: - Widget Configuration
struct TPGStopWidget: Widget {
    let kind: String = "TPGStopWidget"
    
    var body: some WidgetConfiguration {
        IntentConfiguration(kind: kind, intent: ConfigurationIntent.self, provider: TPGStopProvider()) { entry in
            TPGStopWidgetView(entry: entry)
        }
        .configurationDisplayName("TPG Stop Times")
        .description("View real-time departure times for your chosen TPG stop")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

// MARK: - Color Extension
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
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Widget Previews
struct TPGStopWidget_Previews: PreviewProvider {
    static var previews: some View {
        let sampleEntry = TPGStopEntry(
            date: Date(),
            stopName: "Cornavin",
            stopId: "8587057",
            departures: [
                DepartureInfo(vehicleType: "Tram", number: "12", destination: "Moillesulaz", minutes: 3, color: "#0066CC"),
                DepartureInfo(vehicleType: "Bus", number: "1", destination: "Balexert", minutes: 7, color: "#FF6600"),
                DepartureInfo(vehicleType: "Tram", number: "18", destination: "Carouge-Rondeau", minutes: 12, color: "#009639")
            ],
            vehicleFilter: nil,
            configuration: ConfigurationIntent()
        )
        
        Group {
            TPGStopWidgetView(entry: sampleEntry)
                .previewContext(WidgetPreviewContext(family: .systemSmall))
                .previewDisplayName("Small")
            
            TPGStopWidgetView(entry: sampleEntry)
                .previewContext(WidgetPreviewContext(family: .systemMedium))
                .previewDisplayName("Medium")
            
            TPGStopWidgetView(entry: sampleEntry)
                .previewContext(WidgetPreviewContext(family: .systemLarge))
                .previewDisplayName("Large")
        }
    }
}