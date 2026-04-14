import axios from "axios";
import { Module } from "../lib/plugins.js";

/* 🔥 API WARM-UP (Render Free sleep prevent) */
setInterval(() => {
  axios
    .get("https://duxx-zx-osint-api.onrender.com/")
    .catch(() => {});
}, 5 * 60 * 1000); // every 5 minutes

Module({
  command: ["lookup"],
  package: "tools",
  description: "Lookup number details"
})(async (message, match) => {

  if (!match) {
    return message.send(
      "❌ Number dao\n\nExample:\n.lookup 8420757226"
    );
  }

  if (!/^\d{8,13}$/.test(match)) {
    return message.send("❌ Valid mobile number dao");
  }

  // ⏳ Please wait message
  const waitMsg = await message.send("⏳ Fetching data, please wait...");
  await message.react("⏳");

  const url =
    "https://duxx-zx-osint-api.onrender.com/api" +
    `?key=Rabbit&type=mobile&term=${encodeURIComponent(match)}`;

  try {
    let res;

    // 🔁 Retry system (slow API safe)
    for (let i = 1; i <= 3; i++) {
      try {
        res = await axios.get(url, {
          timeout: 30000, // 30s for Render free
          headers: {
            "User-Agent": "Mozilla/5.0"
          }
        });
        break;
      } catch (e) {
        if (i === 3) throw e;
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    const api = res.data;

    if (!api?.result?.result || api.result.result.length === 0) {
      await message.react("❌");
      return message.send("❌ Data paoa jay nai");
    }

    // 🟢 Only result send
    const resultText = `
${JSON.stringify(api.result.result, null, 2)}

━━━━━━━━━━━━━━
✨ Pᴏᴡᴇʀᴇᴅ Bʏ Mʀ Ꭺᴋꫝꜱʜ
`;

    await message.send(resultText);
    await message.react("✅");

    // 🧹 delete wait message
    try {
      await message.delete(waitMsg.key);
    } catch {}

  } catch (err) {
    console.error("LOOKUP ERROR:", err?.message);
    await message.react("❌");
    message.send("⚠️ API slow / unavailable. Try again.");
  }
});
