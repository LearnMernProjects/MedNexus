import { HospitalRecord, MOCK_HOSPITALS, Weekday } from "@/lib/mock-hospitals";

export type HospitalRecommendationInput = {
  diseaseType?: string;
  specialty?: string;
  budget?: number;
  location: {
    latitude: number;
    longitude: number;
  };
  preferredTime?: string;
  radiusKm?: number;
  maxResults?: number;
};

export type HospitalRecommendation = {
  hospital: HospitalRecord;
  score: number;
  distanceKm: number;
  isOpenAtPreferredTime: boolean;
  reasons: string[];
};

type ScoreBreakdown = {
  specialty: number;
  budget: number;
  distance: number;
  availability: number;
  rating: number;
};

const DAY_KEYS: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function toLowerSafe(value?: string) {
  return (value ?? "").trim().toLowerCase();
}

function parseTimeToMinutes(time: string) {
  const [hourStr, minuteStr] = time.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  return hour * 60 + minute;
}

function isHospitalOpenAt(hospital: HospitalRecord, date: Date) {
  if (hospital.open24x7) {
    return true;
  }

  const day = DAY_KEYS[date.getDay()];
  const hoursForDay = hospital.openHours?.[day];
  if (!hoursForDay) {
    return false;
  }

  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  const openMinutes = parseTimeToMinutes(hoursForDay.open);
  const closeMinutes = parseTimeToMinutes(hoursForDay.close);

  if (openMinutes === null || closeMinutes === null) {
    return false;
  }

  return nowMinutes >= openMinutes && nowMinutes <= closeMinutes;
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

function scoreSpecialty(hospital: HospitalRecord, requestedSpecialty: string) {
  if (!requestedSpecialty) {
    return 8;
  }

  const hospitalSpecialties = hospital.specialties.map((item) => item.toLowerCase());
  if (hospitalSpecialties.includes(requestedSpecialty)) {
    return 35;
  }

  const partialMatch = hospitalSpecialties.some((item) => item.includes(requestedSpecialty));
  return partialMatch ? 20 : 0;
}

function scoreBudget(hospital: HospitalRecord, budget?: number) {
  if (!budget || budget <= 0) {
    return 8;
  }

  if (hospital.averageConsultationFee <= budget) {
    return 25;
  }

  if (hospital.averageConsultationFee <= budget * 1.25) {
    return 10;
  }

  return -10;
}

function scoreDistance(distanceKm: number, radiusKm: number) {
  if (distanceKm > radiusKm) {
    return -100;
  }

  if (distanceKm <= 2) {
    return 25;
  }

  if (distanceKm <= 5) {
    return 18;
  }

  if (distanceKm <= 10) {
    return 12;
  }

  return 6;
}

function scoreAvailability(isOpenAtPreferredTime: boolean) {
  return isOpenAtPreferredTime ? 18 : -8;
}

function scoreRating(rating: number) {
  return Math.round(rating * 3);
}

export function recommendHospitals(input: HospitalRecommendationInput): HospitalRecommendation[] {
  const radiusKm = input.radiusKm && input.radiusKm > 0 ? input.radiusKm : 15;
  const maxResults = input.maxResults && input.maxResults > 0 ? input.maxResults : 5;
  const preferredDate = input.preferredTime ? new Date(input.preferredTime) : new Date();
  const requestedSpecialty = toLowerSafe(input.specialty || input.diseaseType);

  const scored = MOCK_HOSPITALS.map((hospital) => {
    const distanceKm = haversineDistanceKm(
      input.location.latitude,
      input.location.longitude,
      hospital.latitude,
      hospital.longitude
    );

    const isOpenAtPreferredTime = isHospitalOpenAt(hospital, preferredDate);

    const breakdown: ScoreBreakdown = {
      specialty: scoreSpecialty(hospital, requestedSpecialty),
      budget: scoreBudget(hospital, input.budget),
      distance: scoreDistance(distanceKm, radiusKm),
      availability: scoreAvailability(isOpenAtPreferredTime),
      rating: scoreRating(hospital.rating),
    };

    const score =
      breakdown.specialty +
      breakdown.budget +
      breakdown.distance +
      breakdown.availability +
      breakdown.rating;

    const reasons = [
      `${distanceKm.toFixed(1)} km from current location`,
      `Estimated consultation fee ₹${hospital.averageConsultationFee}`,
      isOpenAtPreferredTime ? "Open at preferred time" : "May be closed at preferred time",
      `Specialties: ${hospital.specialties.join(", ")}`,
    ];

    return {
      hospital,
      score,
      distanceKm,
      isOpenAtPreferredTime,
      reasons,
    };
  })
    .filter((item) => item.distanceKm <= radiusKm)
    .sort((left, right) => right.score - left.score)
    .slice(0, maxResults);

  return scored;
}
