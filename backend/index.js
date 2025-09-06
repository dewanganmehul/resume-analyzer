const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const axios = require("axios");
const fs = require("fs");
const cors = require("cors");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

app.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    const jobDescription = req.body.jobDescription;

   
    const resumeBuffer = fs.readFileSync(req.file.path);
    const resumeData = await pdfParse(resumeBuffer);
    const resumeText = resumeData.text;

    // Prompt for Gemini
    const prompt = `
      You are a resume analyzer. Compare this resume with the job description.
      Return ONLY valid JSON in this format (no extra text, no markdown):
      {
        "match": <number between 0 and 100>,
        "suggestions": ["..."],
        "missingSkills": ["..."]
      }

      Resume:
      ${resumeText}

      Job Description:
      ${jobDescription}
    `;

    // Call Gemini API
    const response = await axios.post(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAadkr2gDYgbaASBvFAembtO8FGX3EqR24`,
  {
    contents: [
      {
        role: "user",   // ✅ required
        parts: [{ text: prompt }],
      },
    ],
  }
);

    let text = response.data.candidates[0].content.parts[0].text || "";
    text = text.trim();

    const match = text.match(/\{[\s\S]*\}/);
    let analysis;
    try {
      if (match) {
        analysis = JSON.parse(match[0]);
      } else {
        analysis = JSON.parse(text);
      }
    } catch (err) {
      console.error("❌ JSON parsing failed:", err.message, "\nResponse was:", text);
      analysis = { match: 0, suggestions: ["Parsing failed"], missingSkills: [] };
    }

  
    res.json(analysis);

  } catch (err) {
    console.error("❌ Error in /analyze:", err.message);
    res.status(500).json({ error: "Analysis failed" });
  }
});


app.listen(5000, () => {
  console.log("✅ Backend running on http://localhost:5000");
});
