import { NextResponse } from "next/server";
import { jobpositions } from "@/lib/mongodb";
import { serializeJobPosition } from "@/lib/serializers";
import { createObjectId } from "@/lib/ids";
import { BadRequestError, parseJobCreate } from "./validators";

const errorResponse = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

export async function GET() {
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
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload = parseJobCreate(body);

    const collection = await jobpositions();
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
