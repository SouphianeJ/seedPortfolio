import { NextResponse } from "next/server";
import { proofs } from "@/lib/mongodb";
import { serializeProof } from "@/lib/serializers";
import { createObjectId } from "@/lib/ids";
import { BadRequestError } from "@/lib/parsers/objectid";
import { parseProofCreate } from "@/lib/parsers/proofs";

const errorResponse = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

export async function GET() {
  try {
    const collection = await proofs();
    const data = await collection.find().sort({ proofName: 1 }).toArray();
    return NextResponse.json(data.map(serializeProof));
  } catch (error) {
    console.error(error);
    return errorResponse("Impossible de charger les preuves.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload = parseProofCreate(body);

    const collection = await proofs();
    const document = { _id: createObjectId(), ...payload };
    await collection.insertOne(document);

    return NextResponse.json(serializeProof(document), { status: 201 });
  } catch (error) {
    if (error instanceof BadRequestError) {
      return errorResponse(error.message, 400);
    }
    console.error(error);
    return errorResponse("Impossible de créer la preuve.", 500);
  }
}
