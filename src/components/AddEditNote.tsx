import {
  CreateNoteSchema,
  createNoteSchema,
} from "@/lib/validation/noteValidator";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import SubmitButton from "./ui/submitButton";
import { useRouter } from "next/navigation";
import { Note } from "@/lib/db/schema";
//import { Note } from "@prisma/client";

interface AddEditNoteProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  noteToEdit?: Note;
}

function AddEditNote({ open, setOpen, noteToEdit }: AddEditNoteProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();

  const form = useForm<CreateNoteSchema>({
    defaultValues: {
      title: noteToEdit?.title || "",
      content: noteToEdit?.content || "",
    },
    resolver: zodResolver(createNoteSchema),
  });

  const onSubmit = async (input: CreateNoteSchema) => {
    try {
      if (noteToEdit) {
        const res = await fetch("/api/notes2", {
          method: "PUT",
          body: JSON.stringify({
            ...input,
            id: noteToEdit.id,
          }),
        });

        if (!res.ok) throw Error("Status code: " + res.status);

        form.reset()
        router.refresh()
      } else {
        const res = await fetch("/api/notes2", {
          method: "POST",
          body: JSON.stringify(input),
        });

        if (!res.ok) throw Error("Status code: " + res.status);
        console.log(res);

        form.reset();
      }
      router.refresh();
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    }
  };

  const deleteNote = async () => {
    if (!noteToEdit) return;

    setIsDeleting(true);
    try {
      const res = await fetch("/api/notes2", {
        method: "DELETE",
        body: JSON.stringify({
          id: noteToEdit.id,
        }),
      });

      if (!res.ok) throw Error("Status code: " + res.status);
      router.refresh();
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{noteToEdit ? "Edit Note" : "Add Note"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Note title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              control={form.control}
              name="title"
            />
            <FormField
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Note content" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              control={form.control}
              name="content"
            />
            <DialogFooter className="gap-1 sm:gap-0">
              {noteToEdit && (
                <SubmitButton
                  onClick={deleteNote}
                  type="button"
                  variant="destructive"
                  loading={isDeleting}
                  disabled={form.formState.isSubmitting}
                >
                  Delete
                </SubmitButton>
              )}
              <SubmitButton
                type="submit"
                loading={form.formState.isSubmitting}
                disabled={isDeleting}
              >
                Submit
              </SubmitButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default AddEditNote;
