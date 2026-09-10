import { CityLocation, DailyHeatReport, WeatherMetrics, DailyHeatForecast } from '../types';

export const reportService = {
  generateDailyReport(
    location: CityLocation,
    weather?: WeatherMetrics,
    daily?: DailyHeatForecast[]
  ): DailyHeatReport {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const currentDaily = daily && daily.length > 0 ? daily[0] : null;
    const peakTemp = currentDaily ? currentDaily.maxTemp : weather ? weather.temperature : location.baseTemp;
    const minTemp = currentDaily ? currentDaily.minTemp : Math.round((peakTemp - 8) * 10) / 10;
    const avgTemp = Math.round(((peakTemp + minTemp) / 2) * 10) / 10;
    const avgHumidity = currentDaily ? currentDaily.avgHumidity : weather ? weather.humidity : location.baseHumidity;
    const maxStress = currentDaily ? currentDaily.peakThermalStress : location.thermalStressScore;
    const risk = currentDaily ? currentDaily.riskLevel : location.riskLevel;

    const isExtreme = risk === 'Extreme';
    const isVeryHigh = risk === 'Very High';

    return {
      date: today,
      locationName: location.name,
      state: location.state,
      avgTemp,
      peakTemp,
      peakTempTime: '2:30 PM (Peak Solar Azimuth)',
      avgHumidity,
      maxThermalStress: maxStress,
      highestRisk: risk,
      peakRiskPeriod: currentDaily?.peakRiskPeriod || '12:00 PM – 4:30 PM',
      heatwaveStatus: isExtreme ? 'Extreme Red Alert' : isVeryHigh ? 'Severe Heatwave' : risk === 'High' ? 'Alert' : 'None',
      precautionsTakenSummary: isExtreme || isVeryHigh
        ? 'Active hydration checkpoints deployed, mandatory shaded work breaks instituted for outdoor labor.'
        : 'Standard public advisory broadcasted, municipal water fountains active.',
      totalVulnerablePopulationRiskEstimate: isExtreme
        ? 'Critical Vulnerability (~42% of workforce & elderly population)'
        : isVeryHigh
        ? 'High Vulnerability (~28% of exposed population)'
        : 'Moderate Baseline (~15% of outdoor workforce)'
    };
  },

  downloadReportJSON(report: DailyHeatReport) {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `HeatGuard_Report_${report.locationName.replace(/\s+/g, '_')}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  printReport() {
    window.print();
  }
};
