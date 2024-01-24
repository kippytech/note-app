import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "brainy - notes",
};

async function Notes() {
  const { userId } = auth();

  if (!userId) throw Error("userId undefined");

  const notes = await prisma.note.findMany({
    where: {
      userId,
    },
  });

  return (
    <div>
      <div>{JSON.stringify(notes)}</div>
    </div>
  );
}

export default Notes;
