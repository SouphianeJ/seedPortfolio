import { NextResponse } from "next/server";
import { jobpositions } from "@/lib/mongodb";
import { serializeJobPosition } from "@/lib/serializers";
import { isValidObjectId, toObjectId } from "@/lib/ids";
import { BadRequestError } from "@/lib/parsers/objectid";
import { parseJobPositionUpdate } from "@/lib/parsers/jobpositions";
import { guardAdminRequest } from "@/lib/auth/api";
const errorResponse = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

export async function GET(
  _request: Request,
  context: RouteContext<"/api/jobpositions/[id]">,
) {
  const guardResponse = await guardAdminRequest();
  if (guardResponse) {
    return guardResponse;
  }

  const { id } = await context.params;

  if (!isValidObjectId(id)) {
    return errorResponse("Identifiant invalide.", 400);
  }

  try {
    const collection = await jobpositions();
    const document = await collection.findOne({ _id: toObjectId(id) });

    if (!document) {
      return errorResponse("Poste introuvable.", 404);
    }

    return NextResponse.json(serializeJobPosition(document));
  } catch (error) {
    console.error(error);
    return errorResponse("Impossible de récupérer le poste.", 500);
  }
}

export async function PUT(
  request: Request,
  context: RouteContext<"/api/jobpositions/[id]">,
) {
  const guardResponse = await guardAdminRequest();
  if (guardResponse) {
    return guardResponse;
  }

  const { id } = await context.params;

  if (!isValidObjectId(id)) {
    return errorResponse("Identifiant invalide.", 400);
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload = await parseJobPositionUpdate(body);
    const collection = await jobpositions();

    if (payload.positionName) {
      const duplicate = await collection.findOne({
        positionName: payload.positionName,
        _id: { $ne: toObjectId(id) },
      });
      if (duplicate) {
        return errorResponse("Un autre poste possède déjà cet intitulé.", 409);
      }
    }

    const updatedJob = await collection.findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: payload },
      { returnDocument: "after" },
    );

    if (!updatedJob) {
      return errorResponse("Poste introuvable.", 404);
    }

    return NextResponse.json(serializeJobPosition(updatedJob));
  } catch (error) {
    if (error instanceof BadRequestError) {
      return errorResponse(error.message, 400);
    }
    console.error(error);
    return errorResponse("Impossible de mettre à jour le poste.", 500);
  }
}
