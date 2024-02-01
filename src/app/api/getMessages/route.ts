import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
//import prisma from "@/lib/db/prisma";

export const runtime = "edge";

export async function GET() {
  // const body = await req.json()

  // const {} = body

  const { userId } = auth();

  if (!userId) return NextResponse.json({ code: "unauthorized" });

  //   const messages = await prisma.message.findMany({
  //     where: {
  //       userId: userId,
  //     },
  //   });
  const userMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.userId, userId));

  return NextResponse.json(userMessages);
}
