export type TimeInfo = {
  createdAt: Date;
  id: string;
  localTime: Date;
  stationId: string;
  updatedAt: Date;
  userId: string;
  utcTime: Date;
  hasMeteorologicalEntry: boolean;
  hasWeatherObservation: boolean;
  hasSynopticCode: boolean;
  hasDailySummary: boolean;
};
