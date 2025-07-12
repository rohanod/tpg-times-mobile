import * as Location from 'expo-location';

export interface LocationResult {
  latitude: number;
  longitude: number;
}

export interface LocationError {
  error: string;
}

class LocationService {
  private static instance: LocationService;
  private lastKnownLocation: LocationResult | null = null;
  private locationRequestInProgress = false;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  private constructor() {}

  /**
   * Get current location with proper error handling and caching
   */
  async getCurrentLocation(): Promise<LocationResult | LocationError> {
    // Prevent multiple simultaneous location requests
    if (this.locationRequestInProgress) {
      if (__DEV__) {
        console.log('Location request already in progress, waiting...');
      }
      
      // Wait for current request to complete
      while (this.locationRequestInProgress) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (this.lastKnownLocation) {
        return this.lastKnownLocation;
      }
    }

    this.locationRequestInProgress = true;

    try {
      if (__DEV__) {
        console.log('Starting location detection process');
      }

      // Check permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (__DEV__) {
          console.log('Location permission denied');
        }
        return { error: 'Location permission denied' };
      }

      if (__DEV__) {
        console.log('Location permission granted, checking if location services are enabled');
      }

      // Check if location services are enabled
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        if (__DEV__) {
          console.log('Location services are disabled');
        }
        return { error: 'Location services are disabled' };
      }

      if (__DEV__) {
        console.log('Location services enabled, attempting to get location');
      }

      // Try to get last known position first (faster)
      try {
        if (__DEV__) {
          console.log('Attempting to get last known position');
        }
        
        const lastKnown = await Location.getLastKnownPositionAsync({
          maxAge: 300000, // 5 minutes
          requiredAccuracy: 1000, // 1km accuracy is fine for finding nearby stops
        });

        if (lastKnown) {
          if (__DEV__) {
            console.log('Successfully got last known position');
          }
          
          const result: LocationResult = {
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
          };
          
          this.lastKnownLocation = result;
          
          if (__DEV__) {
            console.log(`Got location: ${result.latitude}, ${result.longitude}`);
          }
          
          return result;
        }
      } catch (error) {
        if (__DEV__) {
          console.log('Last known position not available, getting current position');
        }
      }

      // Get current position if last known is not available
      if (__DEV__) {
        console.log('Getting current position');
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 15000, // 15 second timeout
      });

      const result: LocationResult = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      this.lastKnownLocation = result;

      if (__DEV__) {
        console.log(`Got current location: ${result.latitude}, ${result.longitude}`);
      }

      return result;

    } catch (error) {
      if (__DEV__) {
        console.error('Error getting location:', error);
      }
      
      let errorMessage = 'Unknown location error';
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Location request timed out';
        } else if (error.message.includes('denied')) {
          errorMessage = 'Location permission denied';
        } else {
          errorMessage = error.message;
        }
      }

      return { error: errorMessage };
    } finally {
      this.locationRequestInProgress = false;
    }
  }

  /**
   * Get cached location if available
   */
  getCachedLocation(): LocationResult | null {
    return this.lastKnownLocation;
  }

  /**
   * Clear cached location
   */
  clearCache(): void {
    this.lastKnownLocation = null;
    if (__DEV__) {
      console.log('Location cache cleared');
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export default LocationService;