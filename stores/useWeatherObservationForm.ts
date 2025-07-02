import { createFormStore } from '@/lib/form-store';

// Define the type for the weather observation form data
type WeatherObservationFormData = {
  clouds?: {
    low: Record<string, string>
    medium: Record<string, string>
    high: Record<string, string>
  };
  significantClouds?: {
    layer1: Record<string, string>
    layer2: Record<string, string>
    layer3: Record<string, string>
    layer4: Record<string, string>
  };
  rainfall?: Record<string, string>;
  wind?: Record<string, string>;
  observer?: Record<string, string>;
  totalCloud?: Record<string, string>;
  metadata?: {
    stationId?: string;
    submittedAt?: string;
    tabActiveAtSubmission?: string;
  };
  // This is a generic structure that can hold any field from the form
  [key: string]: unknown;
};

// Create and export the form store with 24-hour expiry
export const useWeatherObservationForm = createFormStore<WeatherObservationFormData>({
  name: 'weather-observation-form',
  initialData: {
    clouds: { low: {}, medium: {}, high: {} },
    significantClouds: { layer1: {}, layer2: {}, layer3: {}, layer4: {} },
    rainfall: {},
    wind: {},
    observer: {},
    totalCloud: {},
    metadata: {},
  },
  expiryHours: 24, // Form data will reset after 24 hours of inactivity
});
