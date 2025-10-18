import { NextResponse } from "next/server";
import { expertises } from "@/lib/mongodb";
import { serializeExpertise } from "@/lib/serializers";
import { isValidObjectId, toObjectId } from "@/lib/ids";
import { BadRequestError, parseExpertiseUpdate } from "../validators";
const errorResponse = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

export async function GET(
  _request: Request,
  context: RouteContext<"/api/expertises/[id]">,
) {
  const { id } = await context.params;

  if (!isValidObjectId(id)) {
    return errorResponse("Identifiant invalide.", 400);
  }

  try {
    const collection = await expertises();
    const document = await collection.findOne({ _id: toObjectId(id) });

    if (!document) {
      return errorResponse("Expertise introuvable.", 404);
    }

    return NextResponse.json(serializeExpertise(document));
  } catch (error) {
    console.error(error);
    return errorResponse("Impossible de récupérer l'expertise.", 500);
  }
}

export async function PUT(
  request: Request,
  context: RouteContext<"/api/expertises/[id]">,
) {
  const { id } = await context.params;

  if (!isValidObjectId(id)) {
    return errorResponse("Identifiant invalide.", 400);
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload = parseExpertiseUpdate(body);
    const collection = await expertises();

    const updatedExpertise = await collection.findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: payload },
      { returnDocument: "after" },
    );

    if (!updatedExpertise) {
      return errorResponse("Expertise introuvable.", 404);
    }

    return NextResponse.json(serializeExpertise(updatedExpertise));
  } catch (error) {
    if (error instanceof BadRequestError) {
      return errorResponse(error.message, 400);
    }
    console.error(error);
    return errorResponse("Impossible de mettre à jour l'expertise.", 500);
  }
}
