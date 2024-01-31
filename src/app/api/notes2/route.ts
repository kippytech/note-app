import { db } from "@/lib/db";
//import prisma from "@/lib/db/prisma";
import { notes } from "@/lib/db/schema";
import { getEmbedding } from "@/lib/openai";
import {
  createNoteSchema,
  deleteNoteSchema,
  updateNoteSchema,
} from "@/lib/validation/noteValidator";
import { notesIndex } from "@/lib/vectordb";
import { auth } from "@clerk/nextjs";
import { and, eq, notExists } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/lib/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parseResult = createNoteSchema.safeParse(body);

    if (!parseResult.success) {
      console.log(parseResult.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const { title, content } = parseResult.data;

    const { userId, user } = auth();

    if (!userId || user)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const embedding = await getNoteEmbedding(title, content);

    //await db.select().from(users).where(eq(users.id, userId))

    // await db.insert(users).values({
    //   email: user,
    //   id: userId,
    // });

    //then first ensure a note has an embedding b4 creating note in mongodb
    //also if mongodb operation fails no entry creation in pinecone
    //all transcations in tx client rolled back if any fails (start with mongodb b4 pinecone)
    //const note = await db.transaction(async (tx) => {
    const note = await db
      .insert(notes)
      .values({
        title: title,
        content: content,
        userId,
      })
      .returning({ insertedId: notes.id });

    const idString = note[0].insertedId.toString();

    await notesIndex.upsert([
      {
        id: idString,
        values: embedding,
        metadata: { userId },
      },
    ]);

    //return note;
    //});

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

    //const drizzledb = drizzle(db, { schema})

    //const noteExists = await drizzledb.query.notes.findFirst({where: ()})
    const noteExists = await db.select().from(notes).where(eq(notes.id, id)); //returning({selected: notes.userId}) //as unknown as schema.Note[];

    if (noteExists.length === 0)
      return Response.json(
        { error: "No such note was found" },
        { status: 404 },
      );

    const { userId } = auth();

    if (!userId || userId !== noteExists[0].userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const embedding = await getNoteEmbedding(title, content);

    //then first ensure a note has an embedding b4 creating note in mongodb
    //also if mongodb operation fails no entry creation in pinecone
    //all transcations in tx client rolled back if any fails (start with mongodb b4 pinecone)
    const updatedNote = await db
      .update(notes)
      .set({
        title: title,
        content: content,
      })
      .where(and(eq(notes.id, id), eq(notes.userId, userId)))
      .returning({ insertedId: notes.id });

    const idString = updatedNote[0].insertedId.toString();

    await notesIndex.upsert([
      {
        id: idString,
        values: embedding,
        metadata: { userId },
      },
    ]);

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

    const noteExists = await db.select().from(notes).where(eq(notes.id, id)); //as unknown as schema.Note[];

    if (noteExists.length === 0) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }

    const { userId } = auth();

    if (!userId || userId !== noteExists[0].userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db
      .delete(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, userId)));

    await notesIndex.deleteOne(id.toString());

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
