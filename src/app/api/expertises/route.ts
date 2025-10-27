import { NextResponse } from "next/server";
import { guardAdminRequest } from "@/lib/auth/api";
import { expertises } from "@/lib/mongodb";
import { serializeExpertise } from "@/lib/serializers";
import { createObjectId } from "@/lib/ids";
import { BadRequestError, parseExpertiseCreate } from "./validators";

const errorResponse = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

export async function GET() {
  const guardResponse = await guardAdminRequest();
  if (guardResponse) {
    return guardResponse;
  }

  try {
    const collection = await expertises();
    const data = await collection.find().sort({ level: -1 }).toArray();
    return NextResponse.json(data.map(serializeExpertise));
  } catch (error) {
    console.error(error);
    return errorResponse("Impossible de charger les expertises.", 500);
  }
}

export async function POST(request: Request) {
  const guardResponse = await guardAdminRequest();
  if (guardResponse) {
    return guardResponse;
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload = await parseExpertiseCreate(body);

    const collection = await expertises();
    const document = { _id: createObjectId(), ...payload };
    await collection.insertOne(document);

    return NextResponse.json(serializeExpertise(document), { status: 201 });
  } catch (error) {
    if (error instanceof BadRequestError) {
      return errorResponse(error.message, 400);
    }
    console.error(error);
    return errorResponse("Impossible de créer l'expertise.", 500);
  }
}
