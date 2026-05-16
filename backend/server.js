import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      max_tokens: 150,
      messages: [
        {
          role: "system",
          content:
            "Você é um assistente emocional amigável, empático, acolhedor e breve. Você NÃO substitui um psicólogo real.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const response = completion.choices[0].message.content;

    res.json({
      response,
    });
  } catch (error) {
    console.log(error);

    if(error.code === "insuficient_quota"){
      return res.status(500).json({
        response:"A IA está temporariamente indisponível por limite de uso da API"
      });
    }

    res.status(500).json({
      error: "Erro ao comunicar com IA",
    });
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando");
});