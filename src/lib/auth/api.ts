import { NextResponse } from "next/server";
import { getAdminSession } from "./session";

export async function guardAdminRequest() {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
