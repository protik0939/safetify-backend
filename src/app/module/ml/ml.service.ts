import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATASET_PATH = path.join(__dirname, "assets", "crime_dataset_clustered.csv");
const HOTSPOTS_PATH = path.join(__dirname, "assets", "hotspots_with_risk.csv");
const MODEL_PATH = path.join(__dirname, "assets", "crime_risk_model.json");

interface DecisionTree {
  left: number[];
  right: number[];
  feature: number[];
  threshold: number[];
  value: number[];
}

interface CrimeIncident {
  latitude: number;
  longitude: number;
  incident_weekday: string;
  part_of_the_day: string;
  crime: string;
  distance?: number;
}

interface HotspotRecord {
  cluster: number;
  latitude: number;
  longitude: number;
  crime_count: number;
  dominant_crime: string;
  dominant_day: string;
  dominant_time: string;
  risk_level: string;
  risk_score: number;
}

// ----------------------------------------------------
// CSV Parser
// ----------------------------------------------------
function parseCSV(filePath: string): Record<string, string>[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/);
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(",").map(h => h.trim());
  const results: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const char = line[charIdx];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current);

    const record: Record<string, string> = {};
    for (let colIdx = 0; colIdx < headers.length; colIdx++) {
      record[headers[colIdx]] = values[colIdx] ? values[colIdx].trim() : "";
    }
    results.push(record);
  }
  return results;
}

// ----------------------------------------------------
// Load Datasets and Random Forest Model on Startup
// ----------------------------------------------------
console.log("[MLService] Loading ML assets...");
const datasetRaw = parseCSV(DATASET_PATH);
const dataset: CrimeIncident[] = datasetRaw.map(row => ({
  latitude: parseFloat(row.latitude),
  longitude: parseFloat(row.longitude),
  incident_weekday: row.incident_weekday || "",
  part_of_the_day: row.part_of_the_day || "",
  crime: row.crime || ""
})).filter(row => !isNaN(row.latitude) && !isNaN(row.longitude));

const hotspotsRaw = parseCSV(HOTSPOTS_PATH);
const hotspots: HotspotRecord[] = hotspotsRaw.map(row => ({
  cluster: parseInt(row.cluster) || 0,
  latitude: parseFloat(row.latitude),
  longitude: parseFloat(row.longitude),
  crime_count: parseInt(row.crime_count) || 0,
  dominant_crime: row.dominant_crime || "",
  dominant_day: row.dominant_day || "",
  dominant_time: row.dominant_time || "",
  risk_level: row.risk_level || "LOW",
  risk_score: parseFloat(row.risk_score) || 0
})).filter(row => !isNaN(row.latitude) && !isNaN(row.longitude));

const forest: DecisionTree[] = JSON.parse(fs.readFileSync(MODEL_PATH, "utf-8"));
console.log(`[MLService] Loaded ${dataset.length} incident records, ${hotspots.length} hotspots, and ${forest.length} Random Forest decision trees.`);

// ----------------------------------------------------
// Label Encoders
// ----------------------------------------------------
const WEEKDAY_CLASSES = ['friday', 'monday', 'saturday', 'sunday', 'thursday', 'tuesday', 'wednesday'];
const PART_CLASSES = ['afternoon', 'evening', 'morning', 'night', 'noon'];

function transformWeekday(weekday: string): number {
  const idx = WEEKDAY_CLASSES.indexOf(weekday.toLowerCase());
  return idx === -1 ? 0 : idx;
}

function transformPartOfDay(part: string): number {
  const idx = PART_CLASSES.indexOf(part.toLowerCase());
  return idx === -1 ? 0 : idx;
}

// ----------------------------------------------------
// Decision Tree & Random Forest Evaluators
// ----------------------------------------------------
function predictTree(tree: DecisionTree, features: number[]): number {
  let node = 0;
  while (tree.left[node] !== -1 && tree.left[node] !== -2 && tree.left[node] !== undefined) {
    const feat = tree.feature[node];
    const val = features[feat];
    const thresh = tree.threshold[node];
    if (val <= thresh) {
      node = tree.left[node];
    } else {
      node = tree.right[node];
    }
  }
  return tree.value[node];
}

function predictForest(features: number[]): number {
  let sum = 0;
  for (const tree of forest) {
    sum += predictTree(tree, features);
  }
  return sum / forest.length;
}

// ----------------------------------------------------
// Spatial Distance (Haversine)
// ----------------------------------------------------
const EARTH_RADIUS = 6371000; // in meters

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS * c;
}

function findNearbyIncidents(lat: number, lon: number, radius: number): CrimeIncident[] {
  const nearby: CrimeIncident[] = [];
  for (const row of dataset) {
    const dist = haversine(lat, lon, row.latitude, row.longitude);
    if (dist <= radius) {
      nearby.push({
        ...row,
        distance: dist
      });
    }
  }
  return nearby;
}

// ----------------------------------------------------
// Point Risk Engine
// ----------------------------------------------------
const CRIME_WEIGHTS: Record<string, number> = {
  murder: 100,
  rape: 90,
  kidnap: 80,
  robbery: 65,
  assault: 45,
  bodyfound: 30
};
const DEFAULT_CRIME_WEIGHT = 30;

function calculatePointRisk(
  lat: number,
  lon: number,
  weekday: string,
  part_of_day: string,
  radius: number
) {
  let nearby = findNearbyIncidents(lat, lon, radius);

  if (weekday) {
    const wLower = weekday.toLowerCase();
    nearby = nearby.filter(row => row.incident_weekday.toLowerCase() === wLower);
  }

  if (part_of_day) {
    const pLower = part_of_day.toLowerCase();
    nearby = nearby.filter(row => row.part_of_the_day.toLowerCase() === pLower);
  }

  if (nearby.length === 0) {
    return {
      incident_count: 0,
      dominant_crime: null,
      severity_score: 0,
      nearest_distance: 9999,
      risk_score: 0
    };
  }

  let totalWeight = 0;
  const crimeCounts: Record<string, number> = {};
  let minDistance = Infinity;

  for (const row of nearby) {
    const weight = CRIME_WEIGHTS[row.crime.toLowerCase()] ?? DEFAULT_CRIME_WEIGHT;
    totalWeight += weight;

    const crimeKey = row.crime;
    crimeCounts[crimeKey] = (crimeCounts[crimeKey] || 0) + 1;

    if (row.distance !== undefined && row.distance < minDistance) {
      minDistance = row.distance;
    }
  }

  let dominantCrime = "";
  let maxCount = -1;
  for (const crime in crimeCounts) {
    if (crimeCounts[crime] > maxCount) {
      maxCount = crimeCounts[crime];
      dominantCrime = crime;
    }
  }

  const averageSeverity = totalWeight / nearby.length;

  return {
    incident_count: nearby.length,
    dominant_crime: dominantCrime,
    severity_score: Math.round(averageSeverity * 100) / 100,
    nearest_distance: Math.round(minDistance * 100) / 100,
    risk_score: Math.round((averageSeverity * Math.min(nearby.length, 5) / 5) * 100) / 100
  };
}

// ----------------------------------------------------
// Overall Analysis Engine
// ----------------------------------------------------
function calculateOverallAnalysis(
  historical: { severity_score: number; incident_count: number; nearest_distance: number },
  estimatedCrimeCount: number
) {
  const severity = historical.severity_score;
  const incidentCount = historical.incident_count;
  const distance = historical.nearest_distance;

  const frequencyScore = Math.min(incidentCount * 15, 100);

  let distanceScore = 20;
  if (distance <= 50) {
    distanceScore = 100;
  } else if (distance <= 100) {
    distanceScore = 80;
  } else if (distance <= 200) {
    distanceScore = 60;
  } else if (distance <= 300) {
    distanceScore = 40;
  }

  const mlScore = Math.min(estimatedCrimeCount * 10, 100);

  const finalScore =
    severity * 0.40 +
    frequencyScore * 0.25 +
    distanceScore * 0.20 +
    mlScore * 0.15;

  let level = "LOW";
  let color = "GREEN";
  let recommendation = "Safe to travel.";

  if (finalScore < 35) {
    level = "LOW";
    color = "GREEN";
    recommendation = "Safe to travel.";
  } else if (finalScore < 70) {
    level = "MEDIUM";
    color = "YELLOW";
    recommendation = "Proceed carefully.";
  } else {
    level = "HIGH";
    color = "RED";
    recommendation = "Choose another route if possible.";
  }

  return {
    overall_score: Math.round(finalScore * 100) / 100,
    risk_level: level,
    color: color,
    recommendation: recommendation,
    components: {
      severity: Math.round(severity * 100) / 100,
      frequency: frequencyScore,
      distance: distanceScore,
      ml_prediction: Math.round(mlScore * 100) / 100
    }
  };
}

// ----------------------------------------------------
// Service Interface
// ----------------------------------------------------
const predictPoint = async (payload: {
  latitude: number;
  longitude: number;
  weekday: string;
  part_of_day: string;
  radius?: number;
}) => {
  const radius = payload.radius ?? 300;
  const weekdayEncoded = transformWeekday(payload.weekday);
  const partEncoded = transformPartOfDay(payload.part_of_day);

  const features = [payload.latitude, payload.longitude, weekdayEncoded, partEncoded];
  const prediction = predictForest(features);

  const historical = calculatePointRisk(
    payload.latitude,
    payload.longitude,
    payload.weekday,
    payload.part_of_day,
    radius
  );

  const overall = calculateOverallAnalysis(historical, prediction);

  return {
    success: true,
    location: {
      latitude: payload.latitude,
      longitude: payload.longitude
    },
    historical_analysis: historical,
    ml_prediction: {
      estimated_crime_count: Math.round(prediction * 100) / 100
    },
    overall_analysis: overall
  };
};

const predictRoute = async (payload: {
  weekday: string;
  part_of_day: string;
  radius?: number;
  route: { latitude: number; longitude: number }[];
}) => {
  const radius = payload.radius ?? 300;
  const results: any[] = [];

  if (!payload.route || payload.route.length === 0) {
    throw new Error("Route coordinates are required");
  }

  for (const point of payload.route) {
    const weekdayEncoded = transformWeekday(payload.weekday);
    const partEncoded = transformPartOfDay(payload.part_of_day);

    const features = [point.latitude, point.longitude, weekdayEncoded, partEncoded];
    const estimatedCrimeCount = predictForest(features);

    const historical = calculatePointRisk(
      point.latitude,
      point.longitude,
      payload.weekday,
      payload.part_of_day,
      radius
    );

    const overall = calculateOverallAnalysis(historical, estimatedCrimeCount);

    results.push({
      latitude: point.latitude,
      longitude: point.longitude,
      historical,
      ml_prediction: Math.round(estimatedCrimeCount * 100) / 100,
      overall
    });
  }

  const riskScores = results.map(p => p.overall.overall_score);
  const averageRisk = riskScores.reduce((a, b) => a + b, 0) / riskScores.length;
  const highestRisk = Math.max(...riskScores);

  const highPoints = results.filter(p => p.overall.risk_level === "HIGH").length;
  const mediumPoints = results.filter(p => p.overall.risk_level === "MEDIUM").length;
  const lowPoints = results.filter(p => p.overall.risk_level === "LOW").length;

  let routeLevel = "LOW";
  if (averageRisk < 35) {
    routeLevel = "LOW";
  } else if (averageRisk < 70) {
    routeLevel = "MEDIUM";
  } else {
    routeLevel = "HIGH";
  }

  // 1. Alternative times for the same day
  const timeAlternatives: { part_of_day: string; average_risk_score: number }[] = [];
  const partClasses = ["morning", "noon", "afternoon", "evening", "night"];
  for (const part of partClasses) {
    if (part === payload.part_of_day.toLowerCase()) continue;

    let sumRisk = 0;
    for (const point of payload.route) {
      const weekdayEncoded = transformWeekday(payload.weekday);
      const partEncoded = transformPartOfDay(part);
      const features = [point.latitude, point.longitude, weekdayEncoded, partEncoded];
      const prediction = predictForest(features);

      const historical = calculatePointRisk(
        point.latitude,
        point.longitude,
        payload.weekday,
        part,
        radius
      );
      const overall = calculateOverallAnalysis(historical, prediction);
      sumRisk += overall.overall_score;
    }
    const avgRisk = sumRisk / payload.route.length;
    timeAlternatives.push({
      part_of_day: part,
      average_risk_score: Math.round(avgRisk * 100) / 100
    });
  }
  timeAlternatives.sort((a, b) => a.average_risk_score - b.average_risk_score);

  // 2. Alternative days for the same time of day
  const dayAlternatives: { weekday: string; average_risk_score: number }[] = [];
  const weekdayClasses = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  for (const day of weekdayClasses) {
    if (day === payload.weekday.toLowerCase()) continue;

    let sumRisk = 0;
    for (const point of payload.route) {
      const weekdayEncoded = transformWeekday(day);
      const partEncoded = transformPartOfDay(payload.part_of_day);
      const features = [point.latitude, point.longitude, weekdayEncoded, partEncoded];
      const prediction = predictForest(features);

      const historical = calculatePointRisk(
        point.latitude,
        point.longitude,
        day,
        payload.part_of_day,
        radius
      );
      const overall = calculateOverallAnalysis(historical, prediction);
      sumRisk += overall.overall_score;
    }
    const avgRisk = sumRisk / payload.route.length;
    dayAlternatives.push({
      weekday: day,
      average_risk_score: Math.round(avgRisk * 100) / 100
    });
  }
  dayAlternatives.sort((a, b) => a.average_risk_score - b.average_risk_score);

  return {
    success: true,
    total_points: results.length,
    route_summary: {
      average_risk_score: Math.round(averageRisk * 100) / 100,
      highest_risk_score: Math.round(highestRisk * 100) / 100,
      high_risk_points: highPoints,
      medium_risk_points: mediumPoints,
      low_risk_points: lowPoints,
      overall_route_risk: routeLevel,
      best_alternative_time: timeAlternatives[0] || null,
      best_alternative_day: dayAlternatives[0] || null
    },
    alternative_times: timeAlternatives,
    alternative_days: dayAlternatives,
    points: results
  };
};

const predictHotspots = async (payload: {
  weekday: string;
  part_of_day: string;
  radius?: number;
}) => {
  const radius = payload.radius ?? 300;
  const weekdayEncoded = transformWeekday(payload.weekday);
  const partEncoded = transformPartOfDay(payload.part_of_day);

  const results = [];
  for (const hotspot of hotspots) {
    const features = [hotspot.latitude, hotspot.longitude, weekdayEncoded, partEncoded];
    const prediction = predictForest(features);

    const historical = calculatePointRisk(
      hotspot.latitude,
      hotspot.longitude,
      payload.weekday,
      payload.part_of_day,
      radius
    );

    const overall = calculateOverallAnalysis(historical, prediction);

    results.push({
      cluster: hotspot.cluster,
      latitude: hotspot.latitude,
      longitude: hotspot.longitude,
      dominant_crime: hotspot.dominant_crime || historical.dominant_crime,
      historical,
      ml_prediction: {
        estimated_crime_count: Math.round(prediction * 100) / 100
      },
      overall_analysis: {
        overall_score: overall.overall_score,
        risk_level: overall.risk_level,
        color: overall.color,
        recommendation: overall.recommendation
      }
    });
  }

  return results;
};

export const MLService = {
  predictPoint,
  predictRoute,
  predictHotspots,
};
