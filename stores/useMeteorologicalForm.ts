import { createFormStore } from '@/lib/form-store';

// Define the type for the meteorological form data
type MeteorologicalFormData = {
  // Include all possible form fields here
  // Temperature tab fields
  dryBulb?: string;
  wetBulb?: string;
  difference?: string;
  dewPoint?: string;
  relativeHumidity?: string;
  // Station information
  stationName?: string;
  stationNo?: string;
  year?: string;
  // Pressure tab fields
  barAsRead?: string;
  heightDifference?: string;
  stationLevelPressure?: string;
  seaLevelReduction?: string;
  correctedSeaLevelPressure?: string;
  // Other tab fields
  Td?: string;
  // This is a generic structure that can hold any field from the form
  [key: string]: unknown;
};

// Create and export the form store with 3-hour expiry
export const useMeteorologicalForm = createFormStore<MeteorologicalFormData>({
  name: 'meteorological-form',
  initialData: {
    // Initialize with empty values
    dryBulb: '',
    wetBulb: '',
    difference: '',
    dewPoint: '',
    relativeHumidity: '',
  },
  expiryHours: 24, // Form data will reset after 3 hours of inactivity
});
