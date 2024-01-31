import Note from "@/components/Note";
import { db } from "@/lib/db";
import { notes } from "@/lib/db/schema";
import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs";
import { Ghost } from "lucide-react";
import { Metadata } from "next";
import React from "react";
import { eq } from "drizzle-orm";

export const metadata: Metadata = {
  title: "brainy - notes",
};

async function Notes() {
  const { userId } = auth();

  if (!userId) throw Error("userId undefined");

  // const notes = await prisma.note.findMany({
  //   where: {
  //     userId,
  //   },
  // });
  const _notes = await db.select().from(notes).where(eq(notes.userId, userId));

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {_notes && _notes.length > 0 ? (
        _notes.map((note) => <Note key={note.id} note={note} />)
      ) : (
        <div className="mt-24 flex max-w-prose  flex-col items-center justify-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold lg:text-lg">
              Pretty empty here
            </h3>
            <Ghost size={20} />
          </div>
          <p>
            You haven&apos;t created any notes. Why don&apos;t you create one?
          </p>
        </div>
      )}
    </div>
  );
}

export default Notes;
