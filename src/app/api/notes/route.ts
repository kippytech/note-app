import prisma from "@/lib/db/prisma";
import {
  createNoteSchema,
  deleteNoteSchema,
  updateNoteSchema,
} from "@/lib/validation/noteValidator";
import { auth } from "@clerk/nextjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

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

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const parseResult = updateNoteSchema.safeParse(body);

    if (!parseResult.success) {
      console.log(parseResult.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const { title, content, id } = parseResult.data;

    const noteExists = await prisma.note.findUnique({
      where: {
        id: id,
      },
    });

    if (!noteExists)
      return Response.json(
        { error: "No such note was found" },
        { status: 404 },
      );

    const { userId } = auth();

    if (!userId || userId !== noteExists.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedNote = await prisma.note.update({
      where: {
        id: id,
      },
      data: {
        title,
        content,
        userId,
      },
    });

    return Response.json({ updatedNote }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    const parseResult = deleteNoteSchema.safeParse(body);

    if (!parseResult.success) {
      console.log(parseResult.error);
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    const { id } = parseResult.data;

    const noteExists = await prisma.note.findUnique({
      where: { id },
    });

    if (!noteExists) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }

    const { userId } = auth();

    if (!userId || userId !== noteExists.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.note.delete({
      where: { id },
    });

    return Response.json(
      { message: "Note successfully deleted!" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return Response.error();
  }
}
