/* eslint-disable @typescript-eslint/no-explicit-any */
import moment from "moment"

interface DailySummaryResult {
  measurements: string[]
  stationNo: string
  dataType: string
  year: string
  month: string
  day: string
}

export const generateDailySummary = (
  entries: any[],
  selectedDate: string,
  stationId: string
): DailySummaryResult => {
  
  const todayFirstCardData = entries.flatMap((item: any) => item.MeteorologicalEntry)
  const todayWeatherObservations = entries.flatMap((item: any) => item.WeatherObservation)
  const calculatedMeasurements = Array(16).fill("");

  // Helper function to process meteorological data
  const processFirstCard = (key: string, id: number, reducer: (arr: number[]) => number) => {
    const values = todayFirstCardData
      .map((item: any) => Number.parseFloat(item[key]))
      .filter((val: number) => !isNaN(val));
    if (values.length > 0) calculatedMeasurements[id] = Math.round(reducer(values)).toString();
  };

  // Calculate pressure measurements
  if (todayFirstCardData.length > 0) {
    processFirstCard("stationLevelPressure", 0, (arr) => arr.reduce((a, b) => a + b, 0) / arr.length);
    processFirstCard("correctedSeaLevelPressure", 1, (arr) => arr.reduce((a, b) => a + b, 0) / arr.length);

    // Calculate temperature measurements
    processFirstCard("dryBulbAsRead", 2, (arr) => arr.reduce((a, b) => a + b, 0) / arr.length);
    processFirstCard("wetBulbAsRead", 3, (arr) => arr.reduce((a, b) => a + b, 0) / arr.length);
    processFirstCard("maxMinTempAsRead", 4, (arr) => Math.max(...arr));
    processFirstCard("maxMinTempAsRead", 5, (arr) => Math.min(...arr));
    processFirstCard("Td", 7, (arr) => arr.reduce((a, b) => a + b, 0) / arr.length);

    // Calculate humidity
    processFirstCard("relativeHumidity", 8, (arr) => arr.reduce((a, b) => a + b, 0) / arr.length);

    // Calculate visibility
    processFirstCard("horizontalVisibility", 14, (arr) => Math.min(...arr));
  }

  // Calculate precipitation
  const rainfallLast24Hours = todayWeatherObservations.map((item: any) => Number.parseFloat(item.rainfallLast24Hours));
  const totalPrecip = rainfallLast24Hours.reduce((sum: number, item: number) => isNaN(item) ? sum : sum + item, 0);
  if (totalPrecip > 0) calculatedMeasurements[6] = totalPrecip.toString();

  // Calculate wind measurements
  const windSpeeds = todayWeatherObservations
    .map((item: any) => Number.parseFloat(item.windSpeed))
    .filter((val) => !isNaN(val));
  if (windSpeeds.length > 0) {
    calculatedMeasurements[9] = Math.round(windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length).toString();
  }

  // Calculate prevailing wind direction
  const directions = todayWeatherObservations.map((item: any) => item.windDirection);
  if (directions.length > 0) {
    const dirCount = directions.reduce((acc: Record<string, number>, dir: string) => {
      acc[dir] = (acc[dir] || 0) + 1;
      return acc;
    }, {});
    
    // Cast the entries to the correct type to fix the TypeScript error
    const entries = Object.entries(dirCount) as [string, number][];
    
    if (entries.length > 0) {
      const mostFrequentDirection = entries.reduce<[string, number]>(
        (a, b) => (a[1] > b[1] ? a : b),
        ["", 0]
      );
      calculatedMeasurements[10] = mostFrequentDirection[0];
    }
  }

  // Calculate max wind speed and direction
  const windData = todayWeatherObservations
    .map((item: any) => ({
      speed: Number.parseFloat(item.windSpeed),
      direction: item.windDirection,
    }))
    .filter((item) => !isNaN(item.speed));
  if (windData.length > 0) {
    const maxWind = windData.reduce((max, item) => (item.speed > max.speed ? item : max));
    calculatedMeasurements[11] = Math.round(maxWind.speed).toString();
    calculatedMeasurements[12] = maxWind.direction;
  }

  // Calculate cloud amount
  const cloudAmounts = todayWeatherObservations
    .map((item: any) => Number.parseFloat(item.totalCloudAmount))
    .filter((val) => !isNaN(val));
  if (cloudAmounts.length > 0) {
    calculatedMeasurements[13] = Math.round(
      cloudAmounts.reduce((a, b) => a + b, 0) / cloudAmounts.length,
    ).toString();
  }

  // Calculate rain duration
  const totalRainDuration = todayWeatherObservations.reduce((totalMinutes: number, item: any) => {
    if (item.rainfallTimeStart && item.rainfallTimeEnd) {
      const startTime = moment(item.rainfallTimeStart, 'YYYY-MM-DD HH:mm:ss');
      const endTime = moment(item.rainfallTimeEnd, 'YYYY-MM-DD HH:mm:ss');
      
      let duration = moment.duration(endTime.diff(startTime)).asMinutes();
      
      if (duration < 0) {
        duration += 1440; // add 24 hours if crossed midnight
      }
      
      return totalMinutes + duration;
    }
    return totalMinutes;
  }, 0);
  
  if (totalRainDuration > 0) {
    const hours = Math.floor(totalRainDuration / 60);
    const minutes = Math.floor(totalRainDuration % 60);
    calculatedMeasurements[15] = `${hours.toString().padStart(2, "0")}${minutes.toString().padStart(2, "0")}`;
  }


  return {
    measurements: calculatedMeasurements,
    stationNo: stationId,
    dataType: "SY",
    year: new Date(selectedDate).getFullYear().toString(),
    month: String(new Date(selectedDate).getMonth() + 1).padStart(2, "0"),
    day: String(new Date(selectedDate).getDate()).padStart(2, "0"),
  };
};