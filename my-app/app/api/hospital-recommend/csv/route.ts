import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { queryBorivaliHospitals } from "@/lib/borivali-hospitals-csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEMO_API_KEY = "demo_borivali_hospital_2026";

const querySchema = z.object({
  apiKey: z.string().optional(),
  location: z.string().optional(),
  specialist: z.string().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  minPrice: z.coerce.number().positive().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  limit: z.coerce.number().int().positive().max(20).optional(),
});

const bodySchema = z.object({
  apiKey: z.string().optional(),
  location: z.string().optional(),
  specialist: z.string().optional(),
  maxPrice: z.number().positive().optional(),
  minPrice: z.number().positive().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  limit: z.number().int().positive().max(20).optional(),
});

function isAuthorized(apiKey: string) {
  const configured = process.env.HOSPITAL_NODE_API_KEY;
  if (configured && configured.trim()) {
    return apiKey === configured.trim();
  }

  return apiKey === DEMO_API_KEY;
}

export async function GET(request: NextRequest) {
  const payload = {
    apiKey: request.nextUrl.searchParams.get("apiKey") ?? undefined,
    location: request.nextUrl.searchParams.get("location") ?? undefined,
    specialist: request.nextUrl.searchParams.get("specialist") ?? undefined,
    maxPrice: request.nextUrl.searchParams.get("maxPrice") ?? undefined,
    minPrice: request.nextUrl.searchParams.get("minPrice") ?? undefined,
    latitude: request.nextUrl.searchParams.get("latitude") ?? undefined,
    longitude: request.nextUrl.searchParams.get("longitude") ?? undefined,
    limit: request.nextUrl.searchParams.get("limit") ?? undefined,
  };

  const parsed = querySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const effectiveApiKey = (parsed.data.apiKey || DEMO_API_KEY).trim();

  if (!isAuthorized(effectiveApiKey)) {
    return NextResponse.json({ error: "Unauthorized API key" }, { status: 401 });
  }

  const hospitals = await queryBorivaliHospitals(parsed.data);

  return NextResponse.json({
    topic: "Borivali nearby hospitals",
    filters: {
      location: parsed.data.location ?? null,
      specialist: parsed.data.specialist ?? null,
      maxPrice: parsed.data.maxPrice ?? null,
      minPrice: parsed.data.minPrice ?? null,
      latitude: parsed.data.latitude ?? null,
      longitude: parsed.data.longitude ?? null,
      limit: parsed.data.limit ?? 10,
    },
    count: hospitals.length,
    hospitals,
  });
}

export async function POST(request: NextRequest) {
  const json = await request.json();
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const effectiveApiKey = (parsed.data.apiKey || DEMO_API_KEY).trim();

  if (!isAuthorized(effectiveApiKey)) {
    return NextResponse.json({ error: "Unauthorized API key" }, { status: 401 });
  }

  const hospitals = await queryBorivaliHospitals(parsed.data);

  return NextResponse.json({
    topic: "Borivali nearby hospitals",
    count: hospitals.length,
    hospitals,
  });
}
