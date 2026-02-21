export interface SFNeighborhood {
  name: string;
  zipcode: string;
  lat: number;
  lng: number;
  areaSqMiles: number;
}

export const SF_NEIGHBORHOODS: SFNeighborhood[] = [
  { name: "Financial District", zipcode: "94104", lat: 37.7946, lng: -122.3999, areaSqMiles: 0.36 },
  { name: "SoMa", zipcode: "94103", lat: 37.7785, lng: -122.3950, areaSqMiles: 1.17 },
  { name: "Mission District", zipcode: "94110", lat: 37.7599, lng: -122.4148, areaSqMiles: 1.05 },
  { name: "Castro", zipcode: "94114", lat: 37.7609, lng: -122.4350, areaSqMiles: 0.76 },
  { name: "Haight-Ashbury", zipcode: "94117", lat: 37.7692, lng: -122.4481, areaSqMiles: 0.65 },
  { name: "Richmond District", zipcode: "94118", lat: 37.7800, lng: -122.4631, areaSqMiles: 1.85 },
  { name: "Sunset District", zipcode: "94122", lat: 37.7546, lng: -122.4869, areaSqMiles: 3.50 },
  { name: "Outer Sunset", zipcode: "94116", lat: 37.7441, lng: -122.4936, areaSqMiles: 2.10 },
  { name: "Noe Valley", zipcode: "94114", lat: 37.7502, lng: -122.4337, areaSqMiles: 0.52 },
  { name: "Potrero Hill", zipcode: "94107", lat: 37.7604, lng: -122.3925, areaSqMiles: 0.78 },
  { name: "Dogpatch", zipcode: "94107", lat: 37.7580, lng: -122.3870, areaSqMiles: 0.25 },
  { name: "Bayview", zipcode: "94124", lat: 37.7295, lng: -122.3882, areaSqMiles: 2.50 },
  { name: "Excelsior", zipcode: "94112", lat: 37.7234, lng: -122.4296, areaSqMiles: 1.65 },
  { name: "Visitacion Valley", zipcode: "94134", lat: 37.7120, lng: -122.4051, areaSqMiles: 0.95 },
  { name: "Ingleside", zipcode: "94112", lat: 37.7234, lng: -122.4456, areaSqMiles: 1.20 },
  { name: "Outer Mission", zipcode: "94112", lat: 37.7183, lng: -122.4443, areaSqMiles: 0.80 },
  { name: "Glen Park", zipcode: "94131", lat: 37.7340, lng: -122.4340, areaSqMiles: 0.55 },
  { name: "Bernal Heights", zipcode: "94110", lat: 37.7440, lng: -122.4155, areaSqMiles: 0.65 },
  { name: "North Beach", zipcode: "94133", lat: 37.8060, lng: -122.4103, areaSqMiles: 0.30 },
  { name: "Chinatown", zipcode: "94108", lat: 37.7941, lng: -122.4078, areaSqMiles: 0.21 },
  { name: "Tenderloin", zipcode: "94102", lat: 37.7847, lng: -122.4141, areaSqMiles: 0.28 },
  { name: "Nob Hill", zipcode: "94109", lat: 37.7930, lng: -122.4161, areaSqMiles: 0.30 },
  { name: "Russian Hill", zipcode: "94109", lat: 37.8011, lng: -122.4194, areaSqMiles: 0.35 },
  { name: "Pacific Heights", zipcode: "94115", lat: 37.7925, lng: -122.4382, areaSqMiles: 0.48 },
  { name: "Marina District", zipcode: "94123", lat: 37.8012, lng: -122.4364, areaSqMiles: 0.55 },
  { name: "Presidio Heights", zipcode: "94118", lat: 37.7870, lng: -122.4524, areaSqMiles: 0.42 },
  { name: "Western Addition", zipcode: "94115", lat: 37.7816, lng: -122.4368, areaSqMiles: 0.60 },
  { name: "Hayes Valley", zipcode: "94102", lat: 37.7762, lng: -122.4242, areaSqMiles: 0.22 },
  { name: "Japantown", zipcode: "94115", lat: 37.7854, lng: -122.4305, areaSqMiles: 0.15 },
  { name: "Inner Richmond", zipcode: "94118", lat: 37.7800, lng: -122.4590, areaSqMiles: 0.85 },
  { name: "Outer Richmond", zipcode: "94121", lat: 37.7776, lng: -122.4936, areaSqMiles: 1.50 },
  { name: "Inner Sunset", zipcode: "94122", lat: 37.7596, lng: -122.4650, areaSqMiles: 0.80 },
  { name: "Parkside", zipcode: "94116", lat: 37.7380, lng: -122.4750, areaSqMiles: 1.10 },
  { name: "Twin Peaks", zipcode: "94131", lat: 37.7544, lng: -122.4477, areaSqMiles: 0.35 },
  { name: "Diamond Heights", zipcode: "94131", lat: 37.7433, lng: -122.4410, areaSqMiles: 0.40 },
  { name: "Mission Bay", zipcode: "94158", lat: 37.7700, lng: -122.3900, areaSqMiles: 0.55 },
  { name: "Treasure Island", zipcode: "94130", lat: 37.8235, lng: -122.3708, areaSqMiles: 0.56 },
  { name: "Hunters Point", zipcode: "94124", lat: 37.7295, lng: -122.3725, areaSqMiles: 1.80 },
  { name: "Crocker Amazon", zipcode: "94112", lat: 37.7100, lng: -122.4350, areaSqMiles: 0.70 },
  { name: "Lakeshore", zipcode: "94132", lat: 37.7260, lng: -122.4830, areaSqMiles: 1.30 },
  { name: "Merced Heights", zipcode: "94132", lat: 37.7180, lng: -122.4720, areaSqMiles: 0.45 },
  { name: "Oceanview", zipcode: "94112", lat: 37.7170, lng: -122.4570, areaSqMiles: 0.55 },
  { name: "Portola", zipcode: "94134", lat: 37.7260, lng: -122.4060, areaSqMiles: 0.75 },
];

export const SF_ZIPCODES = [...new Set(SF_NEIGHBORHOODS.map((n) => n.zipcode))];
