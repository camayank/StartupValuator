import { Router } from "express";
import OpenAI from "openai";
import { z } from "zod";
import { pitchDeckFormSchema, type PitchDeckFormData } from "../validations/pitch-deck";
import { pdf } from "@react-pdf/renderer";
import { createPitchDeckDocument } from "../components/PitchDeckPDF";

const router = Router();

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/api/pitch-deck/personalize", async (req, res) => {
  try {
    const data = pitchDeckFormSchema.parse(req.body);

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert startup advisor specializing in YC applications and pitch deck optimization. Analyze the input and provide specific suggestions to improve each section."
        },
        {
          role: "user",
          content: JSON.stringify(data)
        }
      ],
      response_format: { type: "json_object" }
    });

    const suggestions = JSON.parse(response.choices[0].message.content);
    res.json(suggestions);
  } catch (error) {
    console.error("Pitch deck personalization error:", error);
    res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

router.post("/api/pitch-deck/industry-analysis", async (req, res) => {
  try {
    const { industry, businessModel } = req.body;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are a market research expert. Analyze the industry and business model to provide key insights and recommendations."
        },
        {
          role: "user",
          content: `Industry: ${industry}\nBusiness Model: ${businessModel}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(response.choices[0].message.content);
    res.json(analysis);
  } catch (error) {
    console.error("Industry analysis error:", error);
    res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

router.post("/api/pitch-deck/generate", async (req, res) => {
  try {
    const { data } = req.body;
    const validatedData = pitchDeckFormSchema.parse(data);

    // Generate PDF using the new approach
    const document = createPitchDeckDocument({ content: validatedData });
    const pdfBuffer = await pdf(document).toBuffer();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=pitch-deck.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

export default router;