import prisma from "@/lib/db/prisma";
import { getEmbedding } from "@/lib/openai";
import {
  createNoteSchema,
  deleteNoteSchema,
  updateNoteSchema,
} from "@/lib/validation/noteValidator";
import { notesIndex } from "@/lib/vectordb";
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

    const embedding = await getNoteEmbedding(title, content);

    //then first ensure a note has an embedding b4 creating note in mongodb
    //also if mongodb operation fails no entry creation in pinecone
    //all transcations in tx client rolled back if any fails (start with mongodb b4 pinecone)
    const note = await prisma.$transaction(
      async (tx) => {
        const note = await tx.note.create({
          data: {
            title: title,
            content: content,
            userId,
          },
        });

        await notesIndex.upsert([
          {
            id: note.id,
            values: embedding,
            metadata: { userId },
          },
        ]);

        return note;
      },
      { timeout: 20000 },
    );

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

    const embedding = await getNoteEmbedding(title, content);

    //then first ensure a note has an embedding b4 creating note in mongodb
    //also if mongodb operation fails no entry creation in pinecone
    //all transcations in tx client rolled back if any fails (start with mongodb b4 pinecone)
    const customTimeout = 10000;
    const updatedNote = await prisma.$transaction(
      async (tx) => {
        const updatedNote = await tx.note.update({
          where: {
            id,
          },
          data: {
            title: title,
            content: content,
            userId,
          },
        });

        await notesIndex.upsert([
          {
            id: noteExists.id,
            values: embedding,
            metadata: { userId },
          },
        ]);

        return updatedNote;
      },
      { timeout: customTimeout },
    );

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

    await prisma.$transaction(async (tx) => {
      await tx.note.delete({
        where: { id },
      });

      await notesIndex.deleteOne(id);
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

async function getNoteEmbedding(title: string, content: string | undefined) {
  return getEmbedding(title + "\n\n" + content ?? "");
}
