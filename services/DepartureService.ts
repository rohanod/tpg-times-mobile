import moment from 'moment-timezone';
import { API_ENDPOINTS } from '../config';
import ResponseLogger from './ResponseLogger';

export interface Stop {
  id?: string;
  name: string;
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

export interface VehiclePosition {
  vehicleKey: string;
  position: number;
}

class DepartureService {
  private static instance: DepartureService;
  private activeRequests = new Map<string, Promise<any>>();
  private refreshTimer: NodeJS.Timeout | null = null;
  private readonly REFRESH_INTERVAL = 60000; // 60 seconds (1 minute) refresh interval
  
  static getInstance(): DepartureService {
    if (!DepartureService.instance) {
      DepartureService.instance = new DepartureService();
    }
    return DepartureService.instance;
  }

  private constructor() {}

  /**
   * Fetch stop suggestions with request deduplication
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

    const requestPromise = this.fetchStopSuggestions(query);
    this.activeRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.activeRequests.delete(cacheKey);
    }
  }

  private async fetchStopSuggestions(query: string): Promise<Stop[]> {
    try {
      const url = `${API_ENDPOINTS.LOCATIONS}?query=${encodeURIComponent(query)}&type=station`;
      
      if (__DEV__) {
        console.log('Fetching suggestions from URL:', url);
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data && data.stations && Array.isArray(data.stations)) {
        return data.stations.map((station: any) => ({
          id: station.id,
          name: station.name
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching stop suggestions:', error);
      throw error;
    }
  }

  /**
   * Fetch departures with rate limiting and request deduplication
   */
  async getDepartures(stopName: string, vehicleFilters: string[] = []): Promise<GroupedDeparture[]> {
    if (!stopName?.trim()) {
      throw new Error('Stop name is required');
    }

    const cacheKey = `departures_${stopName.toLowerCase()}`;

    // Check if request is already in progress
    if (this.activeRequests.has(cacheKey)) {
      if (__DEV__) {
        console.log('Request already in progress, waiting for result');
      }
      return this.activeRequests.get(cacheKey);
    }

    const requestPromise = this.fetchDepartures(stopName, vehicleFilters);
    this.activeRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.activeRequests.delete(cacheKey);
    }
  }

  private async fetchDepartures(stopName: string, vehicleFilters: string[]): Promise<GroupedDeparture[]> {
    try {
      const url = `${API_ENDPOINTS.STATIONBOARD}?stop=${encodeURIComponent(stopName)}&limit=300&show_delays=1&transportation_types=tram,bus&mode=depart`;
      
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
        return [];
      }

      return this.processDepartures(data.connections, vehicleFilters);
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
   * Start automatic refresh for a stop
   */
  startAutoRefresh(stopName: string, vehicleFilters: string[], callback: (departures: GroupedDeparture[]) => void): void {
    this.stopAutoRefresh(); // Clear any existing timer

    const refreshFunction = async () => {
      try {
        const departures = await this.getDepartures(stopName, vehicleFilters);
        callback(departures);
        
        // Schedule next refresh
        this.refreshTimer = setTimeout(refreshFunction, this.REFRESH_INTERVAL);
        
        if (__DEV__) {
          const nextRefreshTime = new Date(Date.now() + this.REFRESH_INTERVAL);
          console.log(`Next refresh scheduled for: ${nextRefreshTime.toLocaleTimeString()}`);
        }
      } catch (error) {
        console.error('Auto-refresh error:', error);
        // Retry after a longer interval on error
        this.refreshTimer = setTimeout(refreshFunction, this.REFRESH_INTERVAL * 2);
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
   * Manual refresh with rate limiting
   */
  async manualRefresh(stopName: string, vehicleFilters: string[]): Promise<GroupedDeparture[]> {
    if (__DEV__) {
      console.log('Manual refresh requested for:', stopName);
    }
    
    return this.getDepartures(stopName, vehicleFilters);
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