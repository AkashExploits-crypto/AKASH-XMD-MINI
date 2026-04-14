import { Module } from "../lib/plugins.js";
import axios from 'axios';

// .ai command - GPT-4 powered
Module({
  command: "ai",
  package: "ai",
  description: "Chat with GPT-4 AI",
})(async (message, match) => {
  if (!match) return message.send("_Please provide a question_");
  
  if (match.length > 1000) {
    return message.send("📝 Question too long! Max 1000 characters.");
  }

  try {
    // Send thinking reaction
    const sent = await message.send("💭 Thinking with GPT-4...");
    
    // Fetch AI response from GPT-4 API
    const apiUrl = `https://meta-api.zone.id/ai/chatgptfree?prompt=${encodeURIComponent(match)}`;
    const response = await axios.get(apiUrl, { timeout: 30000 });
    const apiData = response.data;

    // Validate API response
    if (!apiData || typeof apiData !== 'object') {
      throw new Error("Invalid API response format!");
    }

    // Extract response from different possible fields
    let aiResponse = '';
    
    if (apiData.answer && typeof apiData.answer === 'string') {
      aiResponse = apiData.answer.trim();
    } else if (apiData.response && typeof apiData.response === 'string') {
      aiResponse = apiData.response.trim();
    } else if (apiData.message && typeof apiData.message === 'string') {
      aiResponse = apiData.message.trim();
    } else if (apiData.text && typeof apiData.text === 'string') {
      aiResponse = apiData.text.trim();
    } else if (apiData.data && typeof apiData.data === 'string') {
      aiResponse = apiData.data.trim();
    } else if (apiData.content && typeof apiData.content === 'string') {
      aiResponse = apiData.content.trim();
    } else if (typeof apiData === 'string') {
      aiResponse = apiData.trim();
    } else {
      // Try to extract any string value
      for (const key in apiData) {
        if (typeof apiData[key] === 'string' && apiData[key].trim().length > 0) {
          aiResponse = apiData[key].trim();
          break;
        }
      }
    }

    // Check nested structure
    if (!aiResponse && apiData.data && typeof apiData.data === 'object') {
      for (const key in apiData.data) {
        if (typeof apiData.data[key] === 'string' && apiData.data[key].trim().length > 0) {
          aiResponse = apiData.data[key].trim();
          break;
        }
      }
    }

    // If no response found
    if (!aiResponse || aiResponse.length === 0) {
      console.log("API Response:", JSON.stringify(apiData, null, 2));
      throw new Error("API returned empty response!");
    }

    // Limit response length
    if (aiResponse.length > 4000) {
      aiResponse = aiResponse.substring(0, 4000) + "...\n\n(Response truncated)";
    }

    // Send formatted response
    await message.send(`🤖 *GPT-4 AI Response:*\n\n${aiResponse}\n\n📊 *Powered by GPT-4*`, { edit: sent.key });

  } catch (error) {
    console.error("[AI ERROR]:", error.message);
    
    let errorMessage = '⚠️ An error occurred. Please try again later.';
    
    if (error.response) {
      if (error.response.status === 404) {
        errorMessage = '⚠️ API endpoint not found! Service unavailable.';
      } else if (error.response.status === 429) {
        errorMessage = '⚠️ Too many requests! Try again later.';
      } else if (error.response.status >= 500) {
        errorMessage = '⚠️ Server error! AI service having issues.';
      }
    } else if (error.message.includes('timeout')) {
      errorMessage = '⚠️ Request timed out! AI taking too long.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = '⚠️ Cannot connect to AI service! Check internet.';
    }
    
    await message.send(errorMessage);
  }
});

// .chatgpt command - Same GPT-4 API
Module({
  command: "chatgpt",
  package: "ai",
  description: "Chat with GPT AI",
})(async (message, match) => {
  if (!match) return message.send("_Please provide a question_");
  
  if (match.length > 1000) {
    return message.send("📝 Question too long! Max 1000 characters.");
  }

  try {
    const sent = await message.send("💭 Processing with ChatGPT...");
    
    const apiUrl = `https://meta-api.zone.id/ai/chatgptfree?prompt=${encodeURIComponent(match)}`;
    const response = await axios.get(apiUrl, { timeout: 30000 });
    const apiData = response.data;

    if (!apiData || typeof apiData !== 'object') {
      throw new Error("Invalid API response format!");
    }

    let aiResponse = '';
    
    if (apiData.answer && typeof apiData.answer === 'string') {
      aiResponse = apiData.answer.trim();
    } else if (apiData.response && typeof apiData.response === 'string') {
      aiResponse = apiData.response.trim();
    } else if (apiData.message && typeof apiData.message === 'string') {
      aiResponse = apiData.message.trim();
    } else if (apiData.text && typeof apiData.text === 'string') {
      aiResponse = apiData.text.trim();
    } else if (apiData.data && typeof apiData.data === 'string') {
      aiResponse = apiData.data.trim();
    } else if (apiData.content && typeof apiData.content === 'string') {
      aiResponse = apiData.content.trim();
    } else if (typeof apiData === 'string') {
      aiResponse = apiData.trim();
    } else {
      for (const key in apiData) {
        if (typeof apiData[key] === 'string' && apiData[key].trim().length > 0) {
          aiResponse = apiData[key].trim();
          break;
        }
      }
    }

    if (!aiResponse && apiData.data && typeof apiData.data === 'object') {
      for (const key in apiData.data) {
        if (typeof apiData.data[key] === 'string' && apiData.data[key].trim().length > 0) {
          aiResponse = apiData.data[key].trim();
          break;
        }
      }
    }

    if (!aiResponse || aiResponse.length === 0) {
      console.log("API Response:", JSON.stringify(apiData, null, 2));
      throw new Error("API returned empty response!");
    }

    if (aiResponse.length > 4000) {
      aiResponse = aiResponse.substring(0, 4000) + "...\n\n(Response truncated)";
    }

    await message.send(`💬 *ChatGPT Response:*\n\n${aiResponse}\n\n✨ *Powered by GPT-4*`, { edit: sent.key });

  } catch (error) {
    console.error("[CHATGPT ERROR]:", error.message);
    
    let errorMessage = '⚠️ An error occurred. Please try again later.';
    
    if (error.response) {
      if (error.response.status === 404) {
        errorMessage = '⚠️ API endpoint not found! Service unavailable.';
      } else if (error.response.status === 429) {
        errorMessage = '⚠️ Too many requests! Try again later.';
      } else if (error.response.status >= 500) {
        errorMessage = '⚠️ Server error! AI service having issues.';
      }
    } else if (error.message.includes('timeout')) {
      errorMessage = '⚠️ Request timed out! AI taking too long.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = '⚠️ Cannot connect to AI service! Check internet.';
    }
    
    await message.send(errorMessage);
  }
});