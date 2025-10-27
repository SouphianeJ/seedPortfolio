import { NextResponse } from "next/server";
import { guardAdminRequest } from "@/lib/auth/api";
import { projects } from "@/lib/mongodb";
import { serializeProject } from "@/lib/serializers";
import { createObjectId } from "@/lib/ids";
import { BadRequestError } from "@/lib/parsers/objectid";
import { parseProjectCreate } from "@/lib/parsers/projects";

const errorResponse = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

const extractPrimaryYear = (year: unknown): number => {
  if (Array.isArray(year)) {
    const numericValues = year
      .map((entry) => {
        if (typeof entry === "number" && Number.isInteger(entry)) {
          return entry;
        }
        if (typeof entry === "string") {
          const parsed = Number(entry.trim());
          return Number.isInteger(parsed) ? parsed : undefined;
        }
        return undefined;
      })
      .filter((entry): entry is number => entry != null);

    if (numericValues.length === 0) {
      return Number.NEGATIVE_INFINITY;
    }
    return Math.max(...numericValues);
  }
  if (typeof year === "number" && Number.isInteger(year)) {
    return year;
  }
  if (typeof year === "string") {
    const parts = year
      .split(";")
      .map((part) => Number(part.trim()))
      .filter((value) => Number.isInteger(value));

    if (parts.length === 0) {
      return Number.NEGATIVE_INFINITY;
    }
    return Math.max(...parts);
  }
  return Number.NEGATIVE_INFINITY;
};

export async function GET() {
  const guardResponse = await guardAdminRequest();
  if (guardResponse) {
    return guardResponse;
  }

  try {
    const collection = await projects();
    const data = await collection.find().toArray();
    data.sort((a, b) => extractPrimaryYear(b.year) - extractPrimaryYear(a.year));
    return NextResponse.json(data.map(serializeProject));
  } catch (error) {
    console.error(error);
    return errorResponse("Impossible de charger les projets.", 500);
  }
}

export async function POST(request: Request) {
  const guardResponse = await guardAdminRequest();
  if (guardResponse) {
    return guardResponse;
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload = await parseProjectCreate(body);

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
