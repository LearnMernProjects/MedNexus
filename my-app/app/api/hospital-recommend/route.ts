import { NextResponse } from "next/server";
import { z } from "zod";
import { recommendHospitals } from "@/lib/hospital-recommendation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  diseaseType: z.string().min(1).optional(),
  specialty: z.string().min(1).optional(),
  budget: z.number().positive().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  preferredTime: z.string().datetime().optional(),
  radiusKm: z.number().positive().optional(),
  maxResults: z.number().int().positive().max(10).optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = requestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid payload",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const recommendations = recommendHospitals(parsed.data);

    return NextResponse.json({
      recommendations,
      meta: {
        source: "mock-dataset",
        total: recommendations.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST /api/hospital-recommend with patient criteria to get ranked hospitals.",
    csvEndpointForAgentNode: "/api/hospital-recommend/csv",
    demoApiKey: "demo_borivali_hospital_2026",
    nodeUrlTemplate:
      "/api/hospital-recommend/csv?apiKey=demo_borivali_hospital_2026&location={location}&specialist={specialist}&maxPrice={maxPrice}&latitude={latitude}&longitude={longitude}&limit={limit}",
    examplePayload: {
      diseaseType: "cardiology",
      budget: 1200,
      location: {
        latitude: 18.5204,
        longitude: 73.8567,
      },
      preferredTime: new Date().toISOString(),
      radiusKm: 15,
      maxResults: 3,
    },
  });
}
