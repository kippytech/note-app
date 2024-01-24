"use client";

import { Note } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useState } from "react";
import AddEditNote from "./AddEditNote";

interface NoteProps {
  note: Note;
}

function Note({ note }: NoteProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);

  const wasupdated = note.updatedAt > note.createdAt;

  const timestamp = (
    wasupdated ? note.updatedAt : note.createdAt
  ).toDateString();

  return (
    <>
      <Card
        className="transtion-shadow cursor-pointer hover:shadow-lg"
        onClick={() => setShowEditDialog(true)}
      >
        <CardHeader>
          <CardTitle>{note.title}</CardTitle>
          <CardDescription>
            {timestamp}
            {wasupdated && "(updated)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line">{note.content}</p>
        </CardContent>
      </Card>
      <AddEditNote
        open={showEditDialog}
        setOpen={setShowEditDialog}
        noteToEdit={note}
      />
    </>
  );
}

export default Note;
