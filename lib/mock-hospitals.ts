export type Weekday = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export type HospitalRecord = {
  id: string;
  name: string;
  area: string;
  city: string;
  latitude: number;
  longitude: number;
  specialties: string[];
  averageConsultationFee: number;
  open24x7: boolean;
  openHours?: Partial<Record<Weekday, { open: string; close: string }>>;
  doctors: string[];
  rating: number;
};

export const MOCK_HOSPITALS: HospitalRecord[] = [
  {
    id: "hosp-001",
    name: "CityCare Multispeciality Hospital",
    area: "Shivajinagar",
    city: "Pune",
    latitude: 18.5314,
    longitude: 73.8478,
    specialties: ["cardiology", "general medicine", "orthopedics", "emergency"],
    averageConsultationFee: 1200,
    open24x7: true,
    doctors: ["Dr. R. Patil (Cardiology)", "Dr. M. Joshi (General Medicine)"],
    rating: 4.4,
  },
  {
    id: "hosp-002",
    name: "GreenLife Heart and Diabetes Clinic",
    area: "Kothrud",
    city: "Pune",
    latitude: 18.5074,
    longitude: 73.8077,
    specialties: ["cardiology", "diabetology", "general medicine"],
    averageConsultationFee: 900,
    open24x7: false,
    openHours: {
      mon: { open: "08:00", close: "21:00" },
      tue: { open: "08:00", close: "21:00" },
      wed: { open: "08:00", close: "21:00" },
      thu: { open: "08:00", close: "21:00" },
      fri: { open: "08:00", close: "21:00" },
      sat: { open: "09:00", close: "18:00" },
    },
    doctors: ["Dr. S. Kulkarni (Cardiology)", "Dr. N. Kale (Diabetology)"],
    rating: 4.2,
  },
  {
    id: "hosp-003",
    name: "Sunrise Women and Child Hospital",
    area: "Aundh",
    city: "Pune",
    latitude: 18.5589,
    longitude: 73.8076,
    specialties: ["gynecology", "pediatrics", "general medicine"],
    averageConsultationFee: 800,
    open24x7: false,
    openHours: {
      mon: { open: "09:00", close: "20:00" },
      tue: { open: "09:00", close: "20:00" },
      wed: { open: "09:00", close: "20:00" },
      thu: { open: "09:00", close: "20:00" },
      fri: { open: "09:00", close: "20:00" },
      sat: { open: "09:00", close: "17:00" },
    },
    doctors: ["Dr. P. Deshmukh (Gynecology)", "Dr. A. Shah (Pediatrics)"],
    rating: 4.3,
  },
  {
    id: "hosp-004",
    name: "Metro Neuro and Trauma Center",
    area: "Hadapsar",
    city: "Pune",
    latitude: 18.5037,
    longitude: 73.9272,
    specialties: ["neurology", "orthopedics", "emergency"],
    averageConsultationFee: 1500,
    open24x7: true,
    doctors: ["Dr. T. Bhosale (Neurology)", "Dr. V. Inamdar (Orthopedics)"],
    rating: 4.1,
  },
  {
    id: "hosp-005",
    name: "Budget Care Community Hospital",
    area: "Wakad",
    city: "Pune",
    latitude: 18.5977,
    longitude: 73.7609,
    specialties: ["general medicine", "dermatology", "ent"],
    averageConsultationFee: 500,
    open24x7: false,
    openHours: {
      mon: { open: "08:30", close: "19:00" },
      tue: { open: "08:30", close: "19:00" },
      wed: { open: "08:30", close: "19:00" },
      thu: { open: "08:30", close: "19:00" },
      fri: { open: "08:30", close: "19:00" },
      sat: { open: "09:00", close: "16:00" },
      sun: { open: "10:00", close: "14:00" },
    },
    doctors: ["Dr. K. More (General Medicine)", "Dr. J. Rao (Dermatology)"],
    rating: 4,
  },
  {
    id: "hosp-006",
    name: "Prime Oncology and Diagnostics",
    area: "Baner",
    city: "Pune",
    latitude: 18.5665,
    longitude: 73.7792,
    specialties: ["oncology", "general medicine", "radiology"],
    averageConsultationFee: 1800,
    open24x7: false,
    openHours: {
      mon: { open: "09:00", close: "20:00" },
      tue: { open: "09:00", close: "20:00" },
      wed: { open: "09:00", close: "20:00" },
      thu: { open: "09:00", close: "20:00" },
      fri: { open: "09:00", close: "20:00" },
    },
    doctors: ["Dr. H. Sane (Oncology)", "Dr. R. Nene (Radiology)"],
    rating: 4.5,
  },
];
