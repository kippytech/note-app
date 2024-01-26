import prisma from "@/lib/db/prisma";
import openai, { getEmbedding } from "@/lib/openai";
import { notesIndex } from "@/lib/vectordb";
import { auth } from "@clerk/nextjs";
//import { ChatCompletionMessage } from "openai/resources/index.mjs";
import { OpenAIStream, StreamingTextResponse } from "ai";
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

    const truncatedMessages = messages.slice(-6);

    const embedding = await getEmbedding(
      truncatedMessages.map((mssg) => mssg.content).join("\n"),
    );

    const { userId } = auth();

    const vectorQueryResponse = await notesIndex.query({
      vector: embedding,
      topK: 4,
      filter: { userId },
    });

    const relevantNotes = await prisma.note.findMany({
      where: {
        id: {
          in: vectorQueryResponse.matches.map((match) => match.id),
        },
      },
    });

    const systemMessage: ChatCompletionRequestMessage = {
      role: "assistant",
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

    const stream = OpenAIStream(res);

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
