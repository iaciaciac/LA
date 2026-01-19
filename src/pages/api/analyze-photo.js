import { createClient } from "next-sanity";
import { GoogleGenerativeAI } from "@google/generative-ai";

const sanity = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: "2024-01-01",
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
});

// Initialize Gemini
// Only init if key exists to avoid crash
const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { imageUrl, documentId } = req.body;

    if (!imageUrl || !documentId) {
        return res.status(400).json({ message: 'Missing imageUrl or documentId' });
    }

    // 1. MOCK MODE: If keys are missing, return dummy data
    if (!process.env.GEMINI_API_KEY || !process.env.SANITY_API_TOKEN) {
        console.warn("⚠️ Missing API Keys using MOCK MODE");

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const mockAnalysis = {
            "xhs": {
                "viralScore": 8,
                "title": "Clean Fit Vibes 👟✨ (MOCK)",
                "copy": "Morning runs just got a whole lot better. Love the energy of this city. 🏃‍♀️💨\n\n#Running #OOTD #CityWalk #HealthyLifestyle",
                "hashtags": ["Running", "OOTD", "CityWalk", "HealthyLifestyle", "MorningVibes"],
                "critique": "Great natural lighting! Try capturing a lower angle next time for a more dynamic look."
            },
            "douyin": {
                "viralScore": 9,
                "hook": "POV: You started running today 🏃‍♀️",
                "script": "Start with a close-up of tying shoelaces, then cut to running stride. End with a smile and a peace sign. ✌️",
                "copy": "Who else loves a morning run? Comment your favorite route below! 👇 #MorningRun #FitnessMotivation",
                "bgm": "Upbeat Running Playlist - Track 1"
            }
        };

        return res.status(200).json({ success: true, analysis: mockAnalysis, isMock: true });
    }

    try {
        // Fetch image as buffer to send to Gemini
        const imageResp = await fetch(imageUrl);
        const imageArrayBuffer = await imageResp.arrayBuffer();
        const imageBuffer = Buffer.from(imageArrayBuffer);

        // Use Gemini 1.5 Pro for best vision capabilities
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const prompt = `
      You are a **Dual-Platform Content Strategy Engine** specializing in **High-End Streetwear, Running Culture, and Tech Lifestyle**.
      
      **YOUR GOAL:**
      Analyze the image and generate TWO distinct content strategies:
      1. **Xiaohongshu (Red Note)**: Focus on aesthetics, "Clean Fit", mood, and editorial vibes.
      2. **Douyin (TikTok China)**: Focus on narrative, emotional hooks, pacing, BGM, and "Golden 3 Seconds".

      **PERSONA 1: The XHS Visual Editor (Xiaohongshu)**
      - You value: Composition, Color Grading, "Vibe" (氛围感), Minimalist Luxury.
      - Tone: Professional, chic, slightly distant but helpful.
      - Keywords: #OOTD, #CityWalk, #Gorpcore, #CleanFit.

      **PERSONA 2: The Commerce Strategist (Douyin)**
      - You value: "Seeding" (种草), Conversion, "Get Ready With Me" energy, Product/Lifestyle envy.
      - Tone: Cool, Confident, slightly "Flexing" but accessible.
      - Focus: Turning visual aesthetics into commenter questions ("Link?", "What brand?").
      - Goal: Use the high-end visual (from the photo) to drive traffic and commerce.

      **OUTPUT JSON STRUCTURE (PURE JSON ONLY):**
      {
        "xhs": {
             "viralScore": (1-10, based on visual quality),
             "title": (Catchy, emoji-heavy title for XHS cover),
             "copy": (Aesthetic caption, poetic, generous with whitespace, hashtags),
             "hashtags": (Array of 5-8 relevant tags),
             "critique": (Specific advice on lighting/posing to improve 'feel')
        },
        "douyin": {
             "viralScore": (1-10, based on 'seedibility' - potential to drive trends),
             "hook": (Visual Hook: e.g., "Outfit Transition", "POV: Morning Run", "Unboxing"),
             "script": (Actionable script: "Start with close-up of shoes, then cut to stride..."),
             "copy": (Engagement-focused caption. Ask a question. "Guess the mileage?", "Cop or Drop?"),
             "bgm": (Trendy, rhythmic, 'Stüssy store playlist' vibe)
        }
      }
    `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBuffer.toString("base64"),
                    mimeType: "image/jpeg",
                },
            },
        ]);

        const responseText = result.response.text();
        console.log("Gemini Raw Response:", responseText); // Debug log

        // Robust JSON extraction
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No JSON found in response");
        }

        const cleanJson = jsonMatch[0];
        const analysis = JSON.parse(cleanJson);

        // 2. Write back to Sanity
        await sanity
            .patch(documentId)
            .set({
                aiCoach: analysis
            })
            .commit();

        res.status(200).json({ success: true, analysis });

    } catch (error) {
        console.error("AI Analysis Error FULL:", error);

        // Enhance error response for debugging
        const errorMessage = error.message || 'Unknown error occurred';
        let detail = '';
        if (error.response && error.response.promptFeedback) {
            detail = `Block reason: ${error.response.promptFeedback.blockReason}`;
        }

        res.status(500).json({ message: 'Analysis failed', error: errorMessage, detail });
    }
}
