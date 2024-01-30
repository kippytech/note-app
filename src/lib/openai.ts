import { OpenAIApi, Configuration } from "openai-edge";
// import { OpenAI } from "openai";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

//const apiKey = process.env.OPENAI_API_KEY;

// if (!apiKey) {
//   throw Error("OPENAI_API_KEY is not set");
// }

//const openai = new OpenAIApi({ apiKey });
const openai = new OpenAIApi(config);

export default openai;

export async function getEmbedding(text: string) {
  try {
    const res = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: text,
    });

    const result = await res.json();

    return result.data[0].embedding as number[];
  } catch (error) {
    console.log("error generating embeddings", error);
    throw error;
  }
}

// export async function getEmbedding(text: string) {
//   const res = await openai.embeddings.create({        //use openai.embeddings.create({}) if not using edge
//     model: "text-embedding-ada-002",
//     input: text,
//   });

//   const embedding = await res.data[0].embedding;

//   if (!embedding) throw Error("Error generating the embedding");

//   console.log(embedding);

//   return embedding;
//}
