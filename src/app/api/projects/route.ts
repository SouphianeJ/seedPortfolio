import { NextResponse } from "next/server";
import { projects } from "@/lib/mongodb";
import { serializeProject } from "@/lib/serializers";
import { createObjectId } from "@/lib/ids";
import { BadRequestError, parseProjectCreate } from "./validators";

const errorResponse = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

export async function GET() {
  try {
    const collection = await projects();
    const data = await collection.find().sort({ year: -1 }).toArray();
    return NextResponse.json(data.map(serializeProject));
  } catch (error) {
    console.error(error);
    return errorResponse("Impossible de charger les projets.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload = parseProjectCreate(body);

    const collection = await projects();
    const document = { _id: createObjectId(), ...payload };
    await collection.insertOne(document);

    return NextResponse.json(serializeProject(document), { status: 201 });
  } catch (error) {
    if (error instanceof BadRequestError) {
      return errorResponse(error.message, 400);
    }
    console.error(error);
    return errorResponse("Impossible de créer le projet.", 500);
  }
}
