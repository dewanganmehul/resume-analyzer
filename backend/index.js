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

 
    const prompt = `
      You are a resume analyzer. Compare this resume with the job description.
      Return JSON strictly in this format:
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

    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyAadkr2gDYgbaASBvFAembtO8FGX3EqR24`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      }
    );

    // Parse Gemini response
    const analysis = JSON.parse(
      response.data.candidates[0].content.parts[0].text
    );

    res.json(analysis);
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Start server
app.listen(5000, () => {
  console.log("✅ Backend running on http://localhost:5000");
});
