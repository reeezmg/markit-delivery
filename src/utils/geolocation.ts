import { Capacitor } from "@capacitor/core";
import { Geolocation, type Position, type PositionOptions } from "@capacitor/geolocation";

export type LocationSnapshot = {
  timestamp: number;
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
};

const toSnapshot = (position: Position): LocationSnapshot => ({
  timestamp: position.timestamp,
  coords: {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
  },
});

const normalizeOptions = (options?: PositionOptions): PositionOptions => ({
  enableHighAccuracy: options?.enableHighAccuracy,
  timeout: options?.timeout,
  maximumAge: options?.maximumAge,
  minimumUpdateInterval: options?.minimumUpdateInterval,
});

const ensureLocationPermission = async () => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const permissions = await Geolocation.checkPermissions();
    if (permissions.location !== "granted") {
      await Geolocation.requestPermissions({ permissions: ["location"] });
    }
  } catch {
    // If permission checks fail, we still try the native call and fall back where possible.
  }
};

export const getCurrentLocation = async (options?: PositionOptions): Promise<LocationSnapshot> => {
  await ensureLocationPermission();

  try {
    const position = await Geolocation.getCurrentPosition(normalizeOptions(options));
    return toSnapshot(position);
  } catch (nativeError) {
    if (navigator.geolocation) {
      return new Promise<LocationSnapshot>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              timestamp: position.timestamp,
              coords: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
              },
            });
          },
          reject,
          normalizeOptions(options)
        );
      });
    }

    throw nativeError;
  }
};

export const watchLocation = async (
  options: PositionOptions,
  onPosition: (position: LocationSnapshot) => void,
  onError?: (error: any) => void
): Promise<() => Promise<void> | void> => {
  await ensureLocationPermission();

  try {
    const watchId = await Geolocation.watchPosition(normalizeOptions(options), (position, error) => {
      if (error) {
        onError?.(error);
        return;
      }
      if (!position) return;
      onPosition(toSnapshot(position));
    });

    return async () => {
      await Geolocation.clearWatch({ id: watchId });
    };
  } catch (nativeError) {
    if (!navigator.geolocation) throw nativeError;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        onPosition({
          timestamp: position.timestamp,
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
        });
      },
      onError,
      normalizeOptions(options)
    );

    return async () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }
};
