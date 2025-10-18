import { NextResponse } from "next/server";
import { runSeed } from "@/lib/seed";

const errorResponse = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

export async function POST() {
  try {
    const result = await runSeed();
    return NextResponse.json(
      {
        message: "Seeding initial terminé.",
        result,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return errorResponse("Impossible d'initialiser la base de données.", 500);
  }
}
