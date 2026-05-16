const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../server/.env') });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not defined in .env");
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const response = await axios.get(url);
    console.log("Available models:");
    response.data.models.forEach((m) => {
      console.log(`- ${m.name} (${m.displayName})`);
    });
  } catch (error) {
    console.error("Error listing models:", error.response?.data || error.message);
  }
}

listModels();
