import { NextResponse } from "next/server";
import { guardAdminRequest } from "@/lib/auth/api";
import { jobpositions } from "@/lib/mongodb";
import { serializeJobPosition } from "@/lib/serializers";
import { createObjectId } from "@/lib/ids";
import { BadRequestError } from "@/lib/parsers/objectid";
import { parseJobPositionCreate } from "@/lib/parsers/jobpositions";

const errorResponse = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

export async function GET() {
  const guardResponse = await guardAdminRequest();
  if (guardResponse) {
    return guardResponse;
  }

  try {
    const collection = await jobpositions();
    const data = await collection.find().sort({ _id: -1 }).toArray();
    return NextResponse.json(data.map(serializeJobPosition));
  } catch (error) {
    console.error(error);
    return errorResponse("Impossible de charger les postes.", 500);
  }
}

export async function POST(request: Request) {
  const guardResponse = await guardAdminRequest();
  if (guardResponse) {
    return guardResponse;
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload = await parseJobPositionCreate(body);

    const collection = await jobpositions();
    const existing = await collection.findOne({ positionName: payload.positionName });
    if (existing) {
      return errorResponse("Un poste avec cet intitulé existe déjà.", 409);
    }
    const document = { _id: createObjectId(), ...payload };
    await collection.insertOne(document);

    return NextResponse.json(serializeJobPosition(document), { status: 201 });
  } catch (error) {
    if (error instanceof BadRequestError) {
      return errorResponse(error.message, 400);
    }
    console.error(error);
    return errorResponse("Impossible de créer le poste.", 500);
  }
}
