import { NextResponse } from "next/server";
import { projects } from "@/lib/mongodb";
import { serializeProject } from "@/lib/serializers";
import { isValidObjectId, toObjectId } from "@/lib/ids";
import {
  BadRequestError,
  parseProjectUpdate,
} from "@/lib/parsers/projects";
const errorResponse = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

export async function GET(
  _request: Request,
  context: RouteContext<"/api/projects/[id]">,
) {
  const { id } = await context.params;

  if (!isValidObjectId(id)) {
    return errorResponse("Identifiant invalide.", 400);
  }

  try {
    const collection = await projects();
    const document = await collection.findOne({ _id: toObjectId(id) });

    if (!document) {
      return errorResponse("Projet introuvable.", 404);
    }

    return NextResponse.json(serializeProject(document));
  } catch (error) {
    console.error(error);
    return errorResponse("Impossible de récupérer le projet.", 500);
  }
}

export async function PUT(
  request: Request,
  context: RouteContext<"/api/projects/[id]">,
) {
  const { id } = await context.params;

  if (!isValidObjectId(id)) {
    return errorResponse("Identifiant invalide.", 400);
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload = await parseProjectUpdate(body);
    const collection = await projects();

    const updatedProject = await collection.findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: payload },
      { returnDocument: "after" },
    );

    if (!updatedProject) {
      return errorResponse("Projet introuvable.", 404);
    }

    return NextResponse.json(serializeProject(updatedProject));
  } catch (error) {
    if (error instanceof BadRequestError) {
      return errorResponse(error.message, 400);
    }
    console.error(error);
    return errorResponse("Impossible de mettre à jour le projet.", 500);
  }
}
