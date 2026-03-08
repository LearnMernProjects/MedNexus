import { promises as fs } from "fs";
import path from "path";

export type CsvHospitalRecord = {
  id: string;
  name: string;
  area: string;
  city: string;
  latitude: number;
  longitude: number;
  specialties: string[];
  priceMin: number;
  priceMax: number;
  openingTime: string;
  closingTime: string;
  open24x7: boolean;
  phone: string;
};

export type CsvHospitalQuery = {
  location?: string;
  specialist?: string;
  maxPrice?: number;
  minPrice?: number;
  latitude?: number;
  longitude?: number;
  limit?: number;
};

let cache: CsvHospitalRecord[] | null = null;

function normalizeToken(value: string) {
  return value
    .toLowerCase()
    .replace(/["'`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseSearchTokens(value?: string) {
  const text = normalizeToken(value ?? "");
  if (!text) return [];

  return text
    .split(/[;,|]/)
    .map((item) => normalizeToken(item))
    .map((item) => item.replace(/\b(and|or)\b/g, " "))
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter((item) => item.length >= 3)
    .filter((item) => !/^[-+]?\d+(\.\d+)?$/.test(item));
}

function parseBoolean(value: string) {
  return ["true", "1", "yes"].includes(value.trim().toLowerCase());
}

function parseCsvLine(line: string) {
  return line.split(",").map((item) => item.trim());
}

async function resolveCsvPath() {
  const direct = path.join(process.cwd(), "data", "borivali-hospitals.csv");
  try {
    await fs.access(direct);
    return direct;
  } catch {
    return path.join(process.cwd(), "my-app", "data", "borivali-hospitals.csv");
  }
}

export async function loadBorivaliHospitalsCsv() {
  if (cache) {
    return cache;
  }

  const csvPath = await resolveCsvPath();
  const raw = await fs.readFile(csvPath, "utf8");
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    cache = [];
    return cache;
  }

  const records = lines.slice(1).map((line) => {
    const [
      id,
      name,
      area,
      city,
      latitude,
      longitude,
      specialties,
      priceMin,
      priceMax,
      openingTime,
      closingTime,
      open24x7,
      phone,
    ] = parseCsvLine(line);

    return {
      id,
      name,
      area,
      city,
      latitude: Number(latitude),
      longitude: Number(longitude),
      specialties: (specialties || "")
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean),
      priceMin: Number(priceMin),
      priceMax: Number(priceMax),
      openingTime,
      closingTime,
      open24x7: parseBoolean(open24x7),
      phone,
    } as CsvHospitalRecord;
  });

  cache = records;
  return records;
}

function haversineDistanceKm(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number
) {
  const earthRadiusKm = 6371;
  const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const deltaLatitude = degreesToRadians(latitudeB - latitudeA);
  const deltaLongitude = degreesToRadians(longitudeB - longitudeA);

  const a =
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
    Math.cos(degreesToRadians(latitudeA)) *
      Math.cos(degreesToRadians(latitudeB)) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

const BORIVALI_REFERENCE = {
  latitude: 19.2307,
  longitude: 72.8567,
};

export async function queryBorivaliHospitals(query: CsvHospitalQuery) {
  const hospitals = await loadBorivaliHospitalsCsv();
  const locationTokens = parseSearchTokens(query.location);
  const specialistTokens = parseSearchTokens(query.specialist);

  const originLatitude =
    typeof query.latitude === "number" ? query.latitude : BORIVALI_REFERENCE.latitude;
  const originLongitude =
    typeof query.longitude === "number" ? query.longitude : BORIVALI_REFERENCE.longitude;

  const maxPrice = typeof query.maxPrice === "number" ? query.maxPrice : undefined;
  const minPrice = typeof query.minPrice === "number" ? query.minPrice : undefined;
  const limit =
    typeof query.limit === "number" && query.limit > 0
      ? Math.min(Math.floor(query.limit), 20)
      : 10;

  const filtered = hospitals
    .filter((hospital) => {
      if (locationTokens.length > 0) {
        const locationText = normalizeToken(`${hospital.area} ${hospital.city}`);
        const hasLocationMatch = locationTokens.some((token) => locationText.includes(token));
        if (!hasLocationMatch) {
          return false;
        }
      }

      if (specialistTokens.length > 0) {
        const hasSpecialist = specialistTokens.some((requestedToken) => {
          return hospital.specialties.some((specialty) => {
            const value = normalizeToken(specialty);
            return value.includes(requestedToken) || requestedToken.includes(value);
          });
        });

        if (!hasSpecialist) {
          return false;
        }
      }

      if (typeof minPrice === "number" && hospital.priceMax < minPrice) {
        return false;
      }

      if (typeof maxPrice === "number" && hospital.priceMin > maxPrice) {
        return false;
      }

      return true;
    })
    .map((hospital) => {
      const distanceKm = haversineDistanceKm(
        originLatitude,
        originLongitude,
        hospital.latitude,
        hospital.longitude
      );

      return {
        ...hospital,
        distanceKm: Number(distanceKm.toFixed(2)),
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  if (filtered.length > 0) {
    return filtered.slice(0, limit);
  }

  if (locationTokens.length > 0 && typeof query.latitude === "number" && typeof query.longitude === "number") {
    return hospitals
      .filter((hospital) => {
        if (specialistTokens.length > 0) {
          const hasSpecialist = specialistTokens.some((requestedToken) => {
            return hospital.specialties.some((specialty) => {
              const value = normalizeToken(specialty);
              return value.includes(requestedToken) || requestedToken.includes(value);
            });
          });

          if (!hasSpecialist) return false;
        }

        if (typeof minPrice === "number" && hospital.priceMax < minPrice) return false;
        if (typeof maxPrice === "number" && hospital.priceMin > maxPrice) return false;
        return true;
      })
      .map((hospital) => ({
        ...hospital,
        distanceKm: Number(
          haversineDistanceKm(
            originLatitude,
            originLongitude,
            hospital.latitude,
            hospital.longitude
          ).toFixed(2)
        ),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit);
  }

  return [];
}
