import type {
  Mission,
  MissionCost,
  Drone,
  Operator,
  ScoreBand,
  ProfitabilityScoreResult,
  UtilizationScoreResult,
  OperatorScoreResult
} from '../types';

/**
 * Deterministic Profitability Score Engine (0-100)
 * Evaluates net profit margin, travel overhead penalty, retry friction penalty, and delay penalty.
 */
export function computeMissionProfitabilityScore(
  mission: Pick<Mission, 'revenue_pkr' | 'retry_count' | 'delay_minutes' | 'idle_time_minutes'>,
  costs: Pick<MissionCost, 'category' | 'amount_pkr'>[]
): ProfitabilityScoreResult {
  const totalRevenue = Number(mission.revenue_pkr || 0);

  let travelCost = 0;
  let retryCost = 0;
  let laborCost = 0;
  let chemicalCost = 0;
  let batteryCost = 0;
  let reserveCost = 0;
  let totalCost = 0;

  costs.forEach((c) => {
    const amt = Number(c.amount_pkr || 0);
    totalCost += amt;
    switch (c.category) {
      case 'travel': travelCost += amt; break;
      case 'retry_fuel': retryCost += amt; break;
      case 'operator_labor': laborCost += amt; break;
      case 'chemical_loading': chemicalCost += amt; break;
      case 'battery_wear': batteryCost += amt; break;
      case 'maintenance_reserve': reserveCost += amt; break;
      default: break;
    }
  });

  const netProfit = totalRevenue - totalCost;
  const netMarginPercentage = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  let baseScore = 50;
  if (netMarginPercentage >= 40) baseScore = 100;
  else if (netMarginPercentage >= 35) baseScore = 90 + ((netMarginPercentage - 35) / 5) * 10;
  else if (netMarginPercentage >= 25) baseScore = 75 + ((netMarginPercentage - 25) / 10) * 15;
  else if (netMarginPercentage >= 15) baseScore = 60 + ((netMarginPercentage - 15) / 10) * 15;
  else if (netMarginPercentage >= 0) baseScore = 40 + (netMarginPercentage / 15) * 20;
  else baseScore = Math.max(0, 40 + (netMarginPercentage / 20) * 40);

  const travelRatio = totalRevenue > 0 ? (travelCost / totalRevenue) * 100 : 0;
  let travelPenalty = 0;
  if (travelRatio > 25) travelPenalty = 20;
  else if (travelRatio > 15) travelPenalty = 10;
  else if (travelRatio > 10) travelPenalty = 5;

  let retryPenalty = 0;
  if (mission.retry_count >= 4) retryPenalty = 25;
  else if (mission.retry_count >= 2) retryPenalty = 15;
  else if (mission.retry_count === 1) retryPenalty = 8;

  let delayPenalty = 0;
  if (mission.delay_minutes >= 90 || mission.idle_time_minutes >= 90) delayPenalty = 15;
  else if (mission.delay_minutes >= 45 || mission.idle_time_minutes >= 45) delayPenalty = 8;

  const finalScore = Math.min(100, Math.max(0, Math.round(baseScore - travelPenalty - retryPenalty - delayPenalty)));

  let band: ScoreBand = 'average';
  if (finalScore >= 80 && netMarginPercentage >= 35) band = 'excellent';
  else if (finalScore >= 65 && netMarginPercentage >= 25) band = 'good';
  else if (finalScore >= 45 && netMarginPercentage >= 10) band = 'average';
  else if (finalScore >= 25 && netMarginPercentage >= 0) band = 'poor';
  else band = 'critical';

  const reasons: string[] = [];
  const recommendations: string[] = [];

  if (netMarginPercentage >= 35) {
    reasons.push(`High gross yield with ${netMarginPercentage.toFixed(1)}% net surplus.`);
  } else if (netMarginPercentage < 15) {
    reasons.push(`Net margin compressed (${netMarginPercentage.toFixed(1)}%) below target threshold of 35%.`);
  }

  if (travelPenalty > 0) {
    reasons.push(`Travel overhead leakage (${travelRatio.toFixed(1)}% of revenue) caused -${travelPenalty} pt deduction.`);
    recommendations.push(`Assign regional fleet stationed nearer to deployment district to curb transport spend.`);
  } else {
    recommendations.push(`Maintain local operator dispatch protocol for optimal transport efficiency.`);
  }

  if (retryPenalty > 0) {
    reasons.push(`${mission.retry_count} spraying retries burned chemical/battery buffer (-${retryPenalty} pts).`);
    recommendations.push(`Audit drone nozzle calibration and operator weather timing prior to launch.`);
  }

  if (delayPenalty > 0) {
    reasons.push(`Field idle time/delay (${mission.delay_minutes} min delay, ${mission.idle_time_minutes} min idle) incurred -${delayPenalty} pt penalty.`);
    recommendations.push(`Streamline pre-flight battery charging checklist to minimize on-site waiting.`);
  }

  return {
    score: finalScore,
    band,
    netMarginPercentage,
    totalRevenue,
    totalCost,
    netProfit,
    leakageBreakdown: {
      travelCost,
      retryCost,
      laborCost,
      chemicalCost,
      batteryCost,
      reserveCost
    },
    reasons,
    recommendations
  };
}

/**
 * Deterministic Fleet Utilization Score Engine (0-100)
 */
export function computeFleetUtilizationScore(
  drone: Pick<Drone, 'total_flight_hours' | 'maintenance_burden_hours' | 'status'>
): UtilizationScoreResult {
  const totalHours = drone.total_flight_hours + drone.maintenance_burden_hours;
  const utilPct = totalHours > 0 ? (drone.total_flight_hours / totalHours) * 100 : 0;

  let score = Math.round(utilPct);
  if (drone.status === 'maintenance') score = Math.min(score, 45);
  if (drone.status === 'grounded') score = 0;

  let band: ScoreBand = 'average';
  if (score >= 80 && drone.status === 'active') band = 'excellent';
  else if (score >= 65 && drone.status === 'active') band = 'good';
  else if (score >= 45) band = 'average';
  else if (score >= 25) band = 'poor';
  else band = 'critical';

  const reasons: string[] = [];
  const recommendations: string[] = [];

  if (drone.status === 'maintenance') {
    reasons.push(`Currently grounded in heavy maintenance cycle (${drone.maintenance_burden_hours} hrs accumulated).`);
    recommendations.push(`Expedite rotor/ESC overhaul and run automated diagnostic stress check before re-entry.`);
  } else if (utilPct >= 80) {
    reasons.push(`Excellent flight efficiency (${utilPct.toFixed(1)}% active airborne duty).`);
    recommendations.push(`Schedule preventative component inspection at next 50-hour milestone.`);
  } else {
    reasons.push(`Moderate downtime with ${drone.maintenance_burden_hours} maintenance hours against ${drone.total_flight_hours} flight hours.`);
    recommendations.push(`Rotate hardware across regional hubs to balance operational wear.`);
  }

  return {
    score,
    band,
    activeFlightHours: drone.total_flight_hours,
    idleHours: 0,
    maintenanceHours: drone.maintenance_burden_hours,
    utilizationPercentage: utilPct,
    reasons,
    recommendations
  };
}

/**
 * Deterministic Operator Efficiency Score Engine (0-100)
 */
export function computeOperatorEfficiencyScore(
  operator: Pick<Operator, 'total_missions' | 'retry_rate_percentage' | 'experience_years'>,
  avgDelayMinutes = 15
): OperatorScoreResult {
  let score = 85;

  if (operator.retry_rate_percentage > 20) score -= 35;
  else if (operator.retry_rate_percentage > 10) score -= 20;
  else if (operator.retry_rate_percentage > 5) score -= 10;
  else if (operator.retry_rate_percentage < 3) score += 10;

  if (avgDelayMinutes > 60) score -= 20;
  else if (avgDelayMinutes > 30) score -= 10;
  else if (avgDelayMinutes <= 15) score += 5;

  if (operator.experience_years >= 4) score += 5;

  const finalScore = Math.min(100, Math.max(0, Math.round(score)));

  let band: ScoreBand = 'average';
  if (finalScore >= 85) band = 'excellent';
  else if (finalScore >= 70) band = 'good';
  else if (finalScore >= 50) band = 'average';
  else if (finalScore >= 30) band = 'poor';
  else band = 'critical';

  const reasons: string[] = [];
  const recommendations: string[] = [];

  if (operator.retry_rate_percentage > 15) {
    reasons.push(`High retry rate (${operator.retry_rate_percentage}%) degrading field chemical yields.`);
    recommendations.push(`Mandate refresher training on Agras/Falcon nozzle calibration and wind drift monitoring.`);
  } else {
    reasons.push(`Consistent field spraying execution (${operator.retry_rate_percentage}% retry rate).`);
    recommendations.push(`Assign operator to high-value Cotton and Sugarcane prime contracts.`);
  }

  return {
    score: finalScore,
    band,
    totalMissions: operator.total_missions,
    retryRate: operator.retry_rate_percentage,
    avgDelayMinutes,
    reasons,
    recommendations
  };
}
