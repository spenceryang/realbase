import { createChildLogger } from "../../core/logger.js";

const log = createChildLogger("data:transit");

/**
 * BART and Muni stop locations for computing transit proximity.
 * We use a static dataset of major stops rather than parsing GTFS feeds
 * in real-time — this is sufficient for neighborhood-level scoring.
 */

interface TransitStop {
  name: string;
  system: "bart" | "muni";
  lat: number;
  lng: number;
  type: "rail" | "bus" | "light_rail";
}

// Major BART stations in SF
const BART_STOPS: TransitStop[] = [
  { name: "Embarcadero", system: "bart", lat: 37.7929, lng: -122.3969, type: "rail" },
  { name: "Montgomery St", system: "bart", lat: 37.7894, lng: -122.4013, type: "rail" },
  { name: "Powell St", system: "bart", lat: 37.7844, lng: -122.4079, type: "rail" },
  { name: "Civic Center", system: "bart", lat: 37.7796, lng: -122.4142, type: "rail" },
  { name: "16th St Mission", system: "bart", lat: 37.7650, lng: -122.4199, type: "rail" },
  { name: "24th St Mission", system: "bart", lat: 37.7522, lng: -122.4184, type: "rail" },
  { name: "Glen Park", system: "bart", lat: 37.7329, lng: -122.4342, type: "rail" },
  { name: "Balboa Park", system: "bart", lat: 37.7219, lng: -122.4474, type: "rail" },
];

// Major Muni Metro stations
const MUNI_STOPS: TransitStop[] = [
  { name: "Van Ness", system: "muni", lat: 37.7753, lng: -122.4193, type: "light_rail" },
  { name: "Church & Market", system: "muni", lat: 37.7672, lng: -122.4296, type: "light_rail" },
  { name: "Castro", system: "muni", lat: 37.7625, lng: -122.4353, type: "light_rail" },
  { name: "Forest Hill", system: "muni", lat: 37.7485, lng: -122.4585, type: "light_rail" },
  { name: "West Portal", system: "muni", lat: 37.7407, lng: -122.4648, type: "light_rail" },
  { name: "Sunset/Irving", system: "muni", lat: 37.7637, lng: -122.4681, type: "light_rail" },
  { name: "Judah & 9th Ave", system: "muni", lat: 37.7627, lng: -122.4662, type: "light_rail" },
  { name: "Taraval & 19th", system: "muni", lat: 37.7431, lng: -122.4755, type: "light_rail" },
  { name: "Ocean Beach", system: "muni", lat: 37.7533, lng: -122.5100, type: "light_rail" },
  { name: "Chinatown-Rose Pak", system: "muni", lat: 37.7941, lng: -122.4069, type: "light_rail" },
  { name: "T-Third/Bayshore", system: "muni", lat: 37.7430, lng: -122.3881, type: "light_rail" },
];

const ALL_STOPS = [...BART_STOPS, ...MUNI_STOPS];

function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 3959; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface TransitProximity {
  nearestBartDistance: number; // miles
  nearestBartStation: string;
  nearestMuniDistance: number;
  nearestMuniStation: string;
  stopsWithinHalfMile: number;
  stopsWithinOneMile: number;
}

export function computeTransitProximity(
  lat: number,
  lng: number,
): TransitProximity {
  let nearestBart = { distance: Infinity, name: "" };
  let nearestMuni = { distance: Infinity, name: "" };
  let withinHalfMile = 0;
  let withinOneMile = 0;

  for (const stop of ALL_STOPS) {
    const dist = haversineDistance(lat, lng, stop.lat, stop.lng);

    if (dist <= 0.5) withinHalfMile++;
    if (dist <= 1.0) withinOneMile++;

    if (stop.system === "bart" && dist < nearestBart.distance) {
      nearestBart = { distance: dist, name: stop.name };
    }
    if (stop.system === "muni" && dist < nearestMuni.distance) {
      nearestMuni = { distance: dist, name: stop.name };
    }
  }

  return {
    nearestBartDistance: Math.round(nearestBart.distance * 100) / 100,
    nearestBartStation: nearestBart.name,
    nearestMuniDistance: Math.round(nearestMuni.distance * 100) / 100,
    nearestMuniStation: nearestMuni.name,
    stopsWithinHalfMile: withinHalfMile,
    stopsWithinOneMile: withinOneMile,
  };
}

export function computeTransitForNeighborhoods(
  locations: Array<{ zipcode: string; lat: number; lng: number }>,
): Map<string, TransitProximity> {
  const results = new Map<string, TransitProximity>();

  for (const loc of locations) {
    results.set(loc.zipcode, computeTransitProximity(loc.lat, loc.lng));
  }

  log.info(
    { neighborhoods: results.size },
    "Computed transit proximity for all neighborhoods",
  );
  return results;
}
