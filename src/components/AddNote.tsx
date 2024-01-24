import {
  CreateNoteSchema,
  createNoteSchema,
} from "@/lib/validation/noteValidator";
import React from "react";
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

interface AddNoteProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

function AddNote({ open, setOpen }: AddNoteProps) {
  const router = useRouter();

  const form = useForm<CreateNoteSchema>({
    defaultValues: {
      title: "",
      content: "",
    },
    resolver: zodResolver(createNoteSchema),
  });

  const onSubmit = async (input: CreateNoteSchema) => {
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        body: JSON.stringify(input),
      });

      if (!res.ok) throw Error("Status code: " + res.status);

      form.reset();
      router.refresh();
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
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
            <DialogFooter>
              <SubmitButton type="submit" loading={form.formState.isSubmitting}>
                Submit
              </SubmitButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default AddNote;
