import { NextResponse } from "next/server";
import { tools } from "@/lib/mongodb";
import { serializeTool } from "@/lib/serializers";
import { createObjectId } from "@/lib/ids";
import { BadRequestError } from "@/lib/parsers/objectid";
import { parseToolCreate } from "@/lib/parsers/tools";

const errorResponse = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

export async function GET() {
  try {
    const collection = await tools();
    const data = await collection.find().sort({ toolName: 1 }).toArray();
    return NextResponse.json(data.map(serializeTool));
  } catch (error) {
    console.error(error);
    return errorResponse("Impossible de charger les outils.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload = parseToolCreate(body);

    const collection = await tools();
    const document = { _id: createObjectId(), ...payload };
    await collection.insertOne(document);

    return NextResponse.json(serializeTool(document), { status: 201 });
  } catch (error) {
    if (error instanceof BadRequestError) {
      return errorResponse(error.message, 400);
    }
    console.error(error);
    return errorResponse("Impossible de créer l'outil.", 500);
  }
}
