import { NextResponse } from "next/server";
import { tools } from "@/lib/mongodb";
import { serializeTool } from "@/lib/serializers";
import { isValidObjectId, toObjectId } from "@/lib/ids";
import { BadRequestError } from "@/lib/parsers/objectid";
import { parseToolUpdate } from "@/lib/parsers/tools";
import { guardAdminRequest } from "@/lib/auth/api";

const errorResponse = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

export async function GET(
  _request: Request,
  context: RouteContext<"/api/tools/[id]">,
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
    const collection = await tools();
    const document = await collection.findOne({ _id: toObjectId(id) });

    if (!document) {
      return errorResponse("Outil introuvable.", 404);
    }

    return NextResponse.json(serializeTool(document));
  } catch (error) {
    console.error(error);
    return errorResponse("Impossible de récupérer l'outil.", 500);
  }
}

export async function PUT(
  request: Request,
  context: RouteContext<"/api/tools/[id]">,
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
    const payload = parseToolUpdate(body);
    const collection = await tools();

    const updatedTool = await collection.findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: payload },
      { returnDocument: "after" },
    );

    if (!updatedTool) {
      return errorResponse("Outil introuvable.", 404);
    }

    return NextResponse.json(serializeTool(updatedTool));
  } catch (error) {
    if (error instanceof BadRequestError) {
      return errorResponse(error.message, 400);
    }
    console.error(error);
    return errorResponse("Impossible de mettre à jour l'outil.", 500);
  }
}
