import moment from 'moment-timezone';
import { API_ENDPOINTS } from '../config';
import ResponseLogger from './ResponseLogger';

export interface Stop {
  id: string; // DIDOC code - required
  rawName?: string; // Whatever text was used before API call - optional
}

export interface Connection {
  time: string;
  terminal: { name: string };
  type: 'tram' | 'bus';
  line: string;
  color: string;
  delay: number;
}

export interface Departure {
  vehicleType: string;
  number: string;
  destination: string;
  departure: moment.Moment;
  minutes: number;
  delay: number;
  color: string;
}

export interface GroupedDeparture {
  vehicleType: string;
  number: string;
  color: string;
  destinations: {
    [destination: string]: Departure[];
  };
}

export interface DepartureServiceResult {
  formattedStopName: string;
  departures: GroupedDeparture[];
}

export interface VehiclePosition {
  vehicleKey: string;
  position: number;
}

class DepartureService {
  private static instance: DepartureService;
  private activeRequests = new Map<string, Promise<any>>();
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private csvCache: any[] | null = null;
  
  static getInstance(): DepartureService {
    if (!DepartureService.instance) {
      DepartureService.instance = new DepartureService();
    }
    return DepartureService.instance;
  }

  private constructor() {}

  /**
   * Fetch stop suggestions from CSV data with request deduplication
   */
  async getStopSuggestions(query: string): Promise<Stop[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const cacheKey = `suggestions_${query.toLowerCase()}`;
    
    // Check if request is already in progress
    if (this.activeRequests.has(cacheKey)) {
      return this.activeRequests.get(cacheKey);
    }

    const requestPromise = this.fetchStopSuggestionsFromCSV(query);
    this.activeRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.activeRequests.delete(cacheKey);
    }
  }

  private async fetchStopSuggestionsFromCSV(query: string): Promise<Stop[]> {
    try {
      if (__DEV__) {
        console.log('Fetching suggestions from CSV for query:', query);
      }
      
      // Use the CSV service to get suggestions
      const suggestions = await this.getCSVSuggestions(query);
      
      if (__DEV__) {
        console.log(`Found ${suggestions.length} suggestions from CSV`);
      }
      
      return suggestions;
    } catch (error) {
      console.error('Error fetching stop suggestions from CSV:', error);
      throw error;
    }
  }

  private async getCSVSuggestions(query: string): Promise<Stop[]> {
    try {
      // Use cached CSV data if available, otherwise fetch it
      let csvData = this.csvCache;
      
      if (!csvData) {
        const response = await fetch(API_ENDPOINTS.ARRETS_CSV);
        const csvText = await response.text();
        const lines = csvText.split('\n').slice(1).filter(line => line.trim() !== '');
        
        csvData = lines
          .map(line => {
            const parts = line.split(';');
            if (parts.length < 7) return null;
            
            const active = parts[6].trim() === 'Y';
            if (!active) return null;

            const name = parts[1].trim();
            const municipality = parts[2].trim();
            const didocCode = parts[4].trim();
            
            if (!didocCode || !name || !municipality) return null;
            
            return {
              didocCode,
              name,
              municipality,
              fullName: `${municipality}, ${name}`
            };
          })
          .filter(Boolean);
          
        // Cache the parsed data
        this.csvCache = csvData;
        
        if (__DEV__) {
          console.log(`Cached ${csvData.length} stops in DepartureService`);
        }
      }
      
      const normalizedQuery = query.toLowerCase().trim();
      
      const matchingStops = csvData
        .filter(stop => {
          if (!stop) return false;
          
          const stopName = stop.name.toLowerCase();
          const municipality = stop.municipality.toLowerCase();
          const fullName = stop.fullName.toLowerCase();
          
          return stopName.includes(normalizedQuery) || 
                 municipality.includes(normalizedQuery) ||
                 fullName.includes(normalizedQuery);
        })
        // Sort by relevance: exact matches first, then starts with, then contains
        .sort((a, b) => {
          if (!a || !b) return 0;
          
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          const aMunicipality = a.municipality.toLowerCase();
          const bMunicipality = b.municipality.toLowerCase();
          
          // Exact name match gets highest priority
          if (aName === normalizedQuery && bName !== normalizedQuery) return -1;
          if (bName === normalizedQuery && aName !== normalizedQuery) return 1;
          
          // Name starts with query gets second priority
          if (aName.startsWith(normalizedQuery) && !bName.startsWith(normalizedQuery)) return -1;
          if (bName.startsWith(normalizedQuery) && !aName.startsWith(normalizedQuery)) return 1;
          
          // Municipality starts with query gets third priority
          if (aMunicipality.startsWith(normalizedQuery) && !bMunicipality.startsWith(normalizedQuery)) return -1;
          if (bMunicipality.startsWith(normalizedQuery) && !aMunicipality.startsWith(normalizedQuery)) return 1;
          
          // Alphabetical order for remaining matches
          return aName.localeCompare(bName);
        })
        // Remove duplicates based on stop name
        .filter((stop, index, array) => {
          if (!stop) return false;
          return index === array.findIndex(s => s && s.name.toLowerCase() === stop.name.toLowerCase());
        })
        // Limit results for performance
        .slice(0, 10);

      return matchingStops
        .filter(Boolean)
        .map(stop => ({
          id: stop!.didocCode,
          rawName: stop!.fullName // Use the formatted "{Municipality}, {Stop}" format
        }));
    } catch (error) {
      console.error('Error processing CSV suggestions:', error);
      return [];
    }
  }

  /**
   * Fetch departures with request deduplication
   */
  async getDepartures(stop: Stop, vehicleFilters: string[] = []): Promise<DepartureServiceResult> {
    if (!stop?.id?.trim()) {
      throw new Error('Stop ID is required');
    }

    return this.fetchDepartures(stop, vehicleFilters);
  }

  private async fetchDepartures(stop: Stop, vehicleFilters: string[]): Promise<DepartureServiceResult> {
    const url = `${API_ENDPOINTS.STATIONBOARD}?stop=${stop.id}&limit=300&show_delays=1&transportation_types=tram,bus&mode=depart`;
    
    try {
      if (__DEV__) {
        console.log('Fetching departures from URL:', url);
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      // Log all responses for debugging
      await ResponseLogger.getInstance().logResponse(url, response, data);
      
      if (!response.ok) {
        // Check for rate limiting from server
        if (response.status === 429) {
          throw new Error('RATE_LIMITED_BY_SERVER');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!data?.connections) {
        return {
          formattedStopName: data?.stop?.name || stop.rawName || '',
          departures: []
        };
      }

      return {
        formattedStopName: data.stop.name,
        departures: this.processDepartures(data.connections, vehicleFilters)
      };
    } catch (error) {
      console.error('Error fetching departures:', error);
      ResponseLogger.getInstance().logError(url, error);
      throw error;
    }
  }

  private processDepartures(connections: Connection[], vehicleFilters: string[]): GroupedDeparture[] {
    const nowMoment = moment().tz('Europe/Zurich');
    
    // Filter and map connections to departures
    const departures: Departure[] = connections
      .filter((conn): conn is Connection => 
        !!(conn?.time && conn?.terminal?.name && conn?.line)
      )
      .map((conn) => {
        try {
          const departure = moment.tz(conn.time, 'Europe/Zurich');
          const minutesUntilDeparture = Math.ceil(
            moment.duration(departure.diff(nowMoment)).asMinutes()
          );
          
          return {
            vehicleType: conn.type === 'tram' ? 'Tram' : 'Bus',
            number: conn.line || '',
            destination: conn.terminal.name || '',
            departure,
            minutes: minutesUntilDeparture,
            delay: conn.delay ?? 0,
            color: conn.color ? `#${conn.color.split('~')[0]}` : '#FF6600'
          };
        } catch (error) {
          console.error('Error processing departure:', error);
          return null;
        }
      })
      .filter((dep): dep is Departure => dep !== null);

    // Group departures by vehicle
    const groupedDepartures: { [key: string]: GroupedDeparture } = {};
    
    departures.forEach((departure) => {
      const key = `${departure.vehicleType}-${departure.number}`;
      
      if (!groupedDepartures[key]) {
        groupedDepartures[key] = {
          vehicleType: departure.vehicleType,
          number: departure.number,
          color: departure.color,
          destinations: {}
        };
      }
      
      if (!groupedDepartures[key].destinations[departure.destination]) {
        groupedDepartures[key].destinations[departure.destination] = [];
      }
      
      groupedDepartures[key].destinations[departure.destination].push(departure);
    });

    // Apply vehicle filters
    let result = Object.values(groupedDepartures);
    
    if (vehicleFilters.length > 0) {
      const filterSet = new Set(vehicleFilters.map(f => f.trim()));
      result = result.filter(vehicle => 
        filterSet.has(vehicle.number.trim())
      );
    }

    if (__DEV__) {
      console.log(`Processed ${departures.length} departures into ${result.length} grouped vehicles`);
    }

    return result;
  }

  /**
   * Helper to schedule refresh at the next minute (00 seconds)
   */
  private scheduleNextMinute(refreshFn: () => void): void {
    const delay = 60000 - (Date.now() % 60000);
    this.refreshTimer = setTimeout(refreshFn, delay);
    
    if (__DEV__) {
      const nextRefreshTime = new Date(Date.now() + delay);
      console.log(`Next refresh scheduled for: ${nextRefreshTime.toLocaleTimeString()}`);
    }
  }

  /**
   * Start automatic refresh for a stop
   */
  startAutoRefresh(stop: Stop, vehicleFilters: string[], callback: (result: DepartureServiceResult) => void): void {
    this.stopAutoRefresh(); // Clear any existing timer

    const refreshFunction = async () => {
      try {
        const result = await this.getDepartures(stop, vehicleFilters);
        callback(result);
        
        // Schedule next refresh at the next minute mark
        this.scheduleNextMinute(refreshFunction);
      } catch (error) {
        console.error('Auto-refresh error:', error);
        // Retry at the next minute mark even on error
        this.scheduleNextMinute(refreshFunction);
      }
    };

    // Start first refresh immediately
    refreshFunction();
  }

  /**
   * Stop automatic refresh
   */
  stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
      if (__DEV__) {
        console.log('Auto-refresh stopped');
      }
    }
  }

  /**
   * Manual refresh
   */
  async manualRefresh(stopId: string, vehicleFilters: string[]): Promise<DepartureServiceResult> {
    if (__DEV__) {
      console.log('Manual refresh requested for:', stopId);
    }
    
    const stop: Stop = { id: stopId };
    return this.getDepartures(stop, vehicleFilters);
  }

  /**
   * Fetch vehicle positions (placeholder for future implementation)
   */
  async getVehiclePositions(vehicleNumbers: string[]): Promise<VehiclePosition[]> {
    // This would be implemented when vehicle position API is available
    if (__DEV__) {
      console.log('Vehicle positions requested for:', vehicleNumbers);
    }
    
    // Return mock data for now
    return vehicleNumbers.map(number => ({
      vehicleKey: `tram-${number}`,
      position: Math.random() * 100
    }));
  }

  /**
   * Clear all active requests and timers
   */
  cleanup(): void {
    this.stopAutoRefresh();
    this.activeRequests.clear();
    
    if (__DEV__) {
      console.log('DepartureService cleaned up');
    }
  }
}

export default DepartureService;