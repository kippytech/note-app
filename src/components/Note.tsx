import { Note } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

interface NoteProps {
  note: Note;
}

function Note({ note }: NoteProps) {
  const wasupdated = note.updatedAt > note.createdAt;

  const timestamp = (
    wasupdated ? note.updatedAt : note.createdAt
  ).toDateString();

  return (
    <Card>
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
  );
}

export default Note;
