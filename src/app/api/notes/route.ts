import prisma from "@/lib/db/prisma";
import { createNoteSchema } from "@/lib/validation/noteValidator";
import { auth } from "@clerk/nextjs";

export async function POST(req: Request) {
  try {
    const body = req.json();

    const parseResult = createNoteSchema.safeParse(body);

    if (!parseResult.success) {
      console.log(parseResult.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const { title, content } = parseResult.data;

    const { userId } = auth();

    if (!userId)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const note = await prisma.note.create({
      data: {
        title: title,
        content: content,
        userId,
      },
    });

    return Response.json({ note }, { status: 201 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
