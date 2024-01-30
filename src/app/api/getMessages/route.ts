import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export const runtime = "edge";

export async function GET() {
  // const body = await req.json()

  // const {} = body

  const { userId } = auth();

  const messages = await prisma.message.findMany({
    where: {
      userId: userId,
    },
  });

  return NextResponse.json(messages);
}
