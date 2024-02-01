import { db } from "@/lib/db";
//import prisma from "@/lib/db/prisma";
import {
  Note,
  notes,
  messages as _messages,
  MessageSchema,
} from "@/lib/db/schema";
import openai, { getEmbedding } from "@/lib/openai";
import { notesIndex } from "@/lib/vectordb";
import { auth } from "@clerk/nextjs";
//import { ChatCompletionMessage } from "openai/resources/index.mjs";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { arrayContains, eq, inArray } from "drizzle-orm";
import {
  ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi,
} from "openai-edge";

export const runtime = "edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai2 = new OpenAIApi(config);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const messages: ChatCompletionRequestMessage[] = body.messages;
    // const messages: ChatCompletionMessage[] = body.messages;

    const lastMessage = messages[messages.length - 1];

    const truncatedMessages = messages.slice(-12);

    const embedding = await getEmbedding(
      truncatedMessages.map((mssg) => mssg.content).join("\n"),
    );

    const { userId } = auth();

    if (!userId)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const vectorQueryResponse = await notesIndex.query({
      vector: embedding,
      topK: 10,
      filter: { userId },
    });

    // const relevantNotes = await prisma.note.findMany({
    //   where: {
    //     id: {
    //       in: vectorQueryResponse.matches.map((match) => match.id),
    //     },
    //   },
    // });

    const vectorId = vectorQueryResponse.matches.map((match) =>
      parseInt(match.id),
    );

    const relevantNotes = await db
      .select()
      .from(notes)
      .where(inArray(notes.id, vectorId));

    const systemMessage: ChatCompletionRequestMessage = {
      role: "system",
      content:
        "You are an intelligent note-taking app. You answer the users's question based on their existing notes. " +
        "The relevant notes for this query are:\n" +
        relevantNotes
          .map((note) => `Title: ${note.title}\n\nContent: ${note.content}`)
          .join("\n\n"),
    };
    // const systemMessage: ChatCompletionMessage = {
    //   role: "assistant",
    //   content:
    //     "You are an intelligent note-taking app. You answer the users's question based on their existing notes. " +
    //     "The relevant notes for this query are:\n" +
    //     relevantNotes
    //       .map((note) => `Title: ${note.title}\n\nContent: ${note.content}`)
    //       .join("\n\n"),
    // };

    const res = await openai2.createChatCompletion({
      model: "gpt-3.5-turbo",
      temperature: 0,
      stream: true,
      messages: [systemMessage, ...truncatedMessages],
    });
    // const res = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo",
    //   temperature: 0,
    //   stream: true,
    //   messages: [systemMessage, ...truncatedMessages],
    // });

    // const stream = OpenAIStream(res);
    const stream = OpenAIStream(res, {
      //save user message to db for chat log persistency
      onStart: async () => {
        await db.insert(_messages).values({
          userId: userId,
          content: lastMessage.content!,
          role: "user",
        });
      },
      //save ai messages for persistency too
      async onCompletion(completion) {
        await db.insert(_messages).values({
          userId: userId,
          content: completion,
          role: "system",
        });
      },
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
