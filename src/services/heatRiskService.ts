import { RiskLevel, PersonalRiskInput, PersonalRiskResult } from '../types';
import { calculateHeatStress, calculateNoaaHeatIndex, calculateApparentTemperature } from './heatStressEngine';

export const heatRiskService = {
  /**
   * Scientific Human Thermal Stress Index Calculation Engine
   * Powered by NOAA Rothfusz Heat Index & Steadman Apparent Temperature equations.
   */
  calculateThermalStressScore(
    tempC: number,
    humidityPercent: number,
    windKmH: number = 10,
    uvIndex: number = 8
  ): number {
    const result = calculateHeatStress({
      temperature: tempC,
      humidity: humidityPercent,
      windSpeed: windKmH,
      uvIndex
    });
    return result.score;
  },

  calculateHeatStress,
  calculateNoaaHeatIndex,
  calculateApparentTemperature,

  /**
   * Map 0-100 score to standardized disaster management Risk Level
   * 0–20: Low (Green)
   * 21–40: Moderate (Yellow)
   * 41–60: High (Amber)
   * 61–80: Very High (Red)
   * 81–100: Extreme (Purple)
   */
  getRiskLevel(score: number): RiskLevel {
    if (score <= 25) return 'Low';
    if (score <= 45) return 'Moderate';
    if (score <= 65) return 'High';
    if (score <= 82) return 'Very High';
    return 'Extreme';
  },

  getRiskColor(level: RiskLevel): {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    glow: string;
    hex: string;
  } {
    switch (level) {
      case 'Low':
        return {
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-400',
          border: 'border-emerald-500/30',
          badgeBg: 'bg-emerald-500/20',
          glow: 'shadow-emerald-500/20',
          hex: '#10B981',
        };
      case 'Moderate':
        return {
          bg: 'bg-yellow-500/10',
          text: 'text-yellow-400',
          border: 'border-yellow-500/30',
          badgeBg: 'bg-yellow-500/20',
          glow: 'shadow-yellow-500/20',
          hex: '#FACC15',
        };
      case 'High':
        return {
          bg: 'bg-amber-500/10',
          text: 'text-amber-400',
          border: 'border-amber-500/30',
          badgeBg: 'bg-amber-500/20',
          glow: 'shadow-amber-500/20',
          hex: '#F59E0B',
        };
      case 'Very High':
        return {
          bg: 'bg-red-500/10',
          text: 'text-red-400',
          border: 'border-red-500/30',
          badgeBg: 'bg-red-500/20',
          glow: 'shadow-red-500/20',
          hex: '#EF4444',
        };
      case 'Extreme':
        return {
          bg: 'bg-purple-500/15',
          text: 'text-purple-300',
          border: 'border-purple-500/40',
          badgeBg: 'bg-purple-500/30',
          glow: 'shadow-purple-500/30',
          hex: '#A855F7',
        };
    }
  },

  getRiskDescription(level: RiskLevel): string {
    switch (level) {
      case 'Low':
        return 'Normal conditions. Minimal human thermal distress anticipated. Standard hydration is sufficient.';
      case 'Moderate':
        return 'Elevated warmth detected. Comfortable for resting individuals, but sustained outdoor labor requires hydration.';
      case 'High':
        return 'High thermal stress conditions. Fatigue and heat cramps possible with prolonged physical exposure.';
      case 'Very High':
        return 'High thermal stress conditions detected. Heat exhaustion likely. Take active precautions and avoid peak sun.';
      case 'Extreme':
        return 'DANGEROUS CRITICAL HEATWAVE. Heat stroke highly imminent with direct physical exertion. Move to cool shelter.';
    }
  },

  /**
   * Calculate Personalized Human Thermal Risk
   */
  calculatePersonalRisk(input: PersonalRiskInput, ambientScore: number = 84): PersonalRiskResult {
    let vulnerabilityModifier = 0;

    // Age modifier
    if (input.ageGroup === '60+') vulnerabilityModifier += 18;
    else if (input.ageGroup === 'Under 18') vulnerabilityModifier += 10;
    else if (input.ageGroup === '41-60') vulnerabilityModifier += 6;

    // Activity modifier
    if (input.activityLevel === 'Heavy') vulnerabilityModifier += 20;
    else if (input.activityLevel === 'Moderate') vulnerabilityModifier += 12;
    else if (input.activityLevel === 'Light') vulnerabilityModifier += 4;

    // Exposure modifier
    if (input.exposure === 'Direct Sun') vulnerabilityModifier += 18;
    else if (input.exposure === 'Outdoor Shaded') vulnerabilityModifier += 8;

    // Duration modifier
    if (input.duration === '2+ hours') vulnerabilityModifier += 16;
    else if (input.duration === '1-2 hours') vulnerabilityModifier += 10;
    else if (input.duration === '30-60 min') vulnerabilityModifier += 4;

    // Category vulnerability
    if (input.userCategory === 'Outdoor Worker' || input.userCategory === 'Farmer' || input.userCategory === 'Delivery Agent') {
      vulnerabilityModifier += 10;
    } else if (input.userCategory === 'Elderly') {
      vulnerabilityModifier += 15;
    }

    if (input.hasMedicalConditions) {
      vulnerabilityModifier += 14;
    }

    const personalScore = Math.min(100, Math.max(10, Math.round(ambientScore * 0.65 + vulnerabilityModifier * 0.7)));
    const riskLevel = this.getRiskLevel(personalScore);

    const keyContributingFactors = [
      {
        factor: 'Ambient Heat & Humidity',
        impact: ambientScore > 75 ? ('Severe' as const) : ambientScore > 50 ? ('High' as const) : ('Moderate' as const)
      },
      {
        factor: `Exposure Type (${input.exposure})`,
        impact: input.exposure === 'Direct Sun' ? ('Severe' as const) : input.exposure === 'Outdoor Shaded' ? ('Moderate' as const) : ('Low' as const)
      },
      {
        factor: `Physical Exertion (${input.activityLevel})`,
        impact: input.activityLevel === 'Heavy' ? ('Severe' as const) : input.activityLevel === 'Moderate' ? ('High' as const) : ('Low' as const)
      },
      {
        factor: `Physiological Group (${input.userCategory}, ${input.ageGroup})`,
        impact: (input.ageGroup === '60+' || input.userCategory === 'Elderly' || input.hasMedicalConditions) ? ('High' as const) : ('Moderate' as const)
      }
    ];

    const tailoredActions: string[] = [];
    if (personalScore >= 80) {
      tailoredActions.push('Stop all outdoor physical exertion immediately and move to an air-conditioned or ventilated indoor area.');
      tailoredActions.push('Consume cool electrolytes or water (250ml every 15-20 minutes).');
      tailoredActions.push('Apply wet damp cloth to forehead, neck, and wrists to accelerate evaporative cooling.');
      tailoredActions.push('Ensure a colleague or family member monitors you for sudden disorientation or fainting.');
    } else if (personalScore >= 60) {
      tailoredActions.push('Limit continuous outdoor work to maximum 20-30 minute intervals followed by shaded rest.');
      tailoredActions.push('Wear loose, light-colored breathable cotton fabrics and a wide-brim hat.');
      tailoredActions.push('Drink at least 3.5 to 4 liters of fluids throughout the working day.');
      tailoredActions.push('Avoid caffeinated beverages, alcohol, and heavy protein meals during peak hours.');
    } else {
      tailoredActions.push('Maintain regular hydration intervals of 1-2 glasses per hour.');
      tailoredActions.push('Wear protective eyewear and apply SPF 30+ sunscreen if exposed to sunlight.');
      tailoredActions.push('Schedule demanding outdoor tasks during early morning (before 10 AM) or post 5 PM.');
    }

    const warningSigns = [
      'Heavy profuse sweating turning suddenly into dry/hot skin',
      'Sudden throbbing headache or dizziness',
      'Muscle cramping in legs, abdomen, or shoulders',
      'Nausea, vomiting, or blurred vision',
      'Rapid heart rate and shortness of breath',
      'Confusion, slurred speech, or loss of consciousness'
    ];

    return {
      score: personalScore,
      riskLevel,
      vulnerabilityIndex: Math.min(100, Math.round(vulnerabilityModifier * 1.5)),
      keyContributingFactors,
      tailoredActions,
      warningSigns
    };
  }
};
