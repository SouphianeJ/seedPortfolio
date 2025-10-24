import { NextResponse } from "next/server";
import { proofs } from "@/lib/mongodb";
import { serializeProof } from "@/lib/serializers";
import { isValidObjectId, toObjectId } from "@/lib/ids";
import { BadRequestError } from "@/lib/parsers/objectid";
import { parseProofUpdate } from "@/lib/parsers/proofs";

const errorResponse = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

export async function GET(
  _request: Request,
  context: RouteContext<"/api/proofs/[id]">,
) {
  const { id } = await context.params;

  if (!isValidObjectId(id)) {
    return errorResponse("Identifiant invalide.", 400);
  }

  try {
    const collection = await proofs();
    const document = await collection.findOne({ _id: toObjectId(id) });

    if (!document) {
      return errorResponse("Preuve introuvable.", 404);
    }

    return NextResponse.json(serializeProof(document));
  } catch (error) {
    console.error(error);
    return errorResponse("Impossible de récupérer la preuve.", 500);
  }
}

export async function PUT(
  request: Request,
  context: RouteContext<"/api/proofs/[id]">,
) {
  const { id } = await context.params;

  if (!isValidObjectId(id)) {
    return errorResponse("Identifiant invalide.", 400);
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload = parseProofUpdate(body);

    const collection = await proofs();
    const updatedProof = await collection.findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: payload },
      { returnDocument: "after" },
    );

    if (!updatedProof) {
      return errorResponse("Preuve introuvable.", 404);
    }

    return NextResponse.json(serializeProof(updatedProof));
  } catch (error) {
    if (error instanceof BadRequestError) {
      return errorResponse(error.message, 400);
    }
    console.error(error);
    return errorResponse("Impossible de mettre à jour la preuve.", 500);
  }
}
