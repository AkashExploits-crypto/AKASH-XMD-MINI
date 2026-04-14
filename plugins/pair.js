// plugins/pair.js - tries API first, falls back to links
import { Module } from '../lib/plugins.js';

Module({
  command: "pair",
  package: "main",
  description: "Pair your WhatsApp number with this bot",
})(async (message, match) => {
  let number = match && match[0] ? match[0].trim() : null;
  const WEB_URL = "https://akash-xmd-mini.onrender.com/";
  const TG_BOT = "https://t.me/AKASH_MINI_BOT";

  // If no number, show help
  if (!number) {
    await message.conn.sendMessage(message.from, {
      text: `╭━━━「 🐉✨ 𝐀𝐊𝐀𝐒𝐇 𝐗𝐌𝐃 𝐌𝐈𝐍𝐈 ✨🐉 」━━━┈⊷
┃
┃  𝐇𝐨𝐰 𝐭𝐨 𝐏𝐚𝐢𝐫 𝐘𝐨𝐮𝐫 𝐃𝐞𝐯𝐢𝐜𝐞
┃
┃  🌟 *Command:* .pair 919876543210
┃  📌 *Example:* .pair 911234567890
┃
┃  🌐 *Web:* ${WEB_URL}
┃  🤖 *Telegram:* ${TG_BOT}
┃
┃  ⚡ Choose any method to pair.
┃
╰━━━━━━━━━━━━━━━━━━━━┈⊷`
    });
    return;
  }

  let cleanNumber = number.replace(/\D/g, '');
  if (cleanNumber.length < 10 || cleanNumber.length > 15) {
    await message.conn.sendMessage(message.from, {
      text: `❌ Invalid number. Use country code without '+'.\nTry: .pair 919876543210`
    });
    return;
  }

  // First, try to generate code via API
  await message.conn.sendMessage(message.from, {
    text: `⏳ Generating pairing code for +${cleanNumber}...`
  });

  try {
    const API_URL = `https://akash-xmd-mini.onrender.com/pair/${cleanNumber}/`;
    const response = await fetch(API_URL);
    const data = await response.json();

    if (data.ok && data.code) {
      const code = data.code;
      const formatted = code.match(/.{1,4}/g)?.join('-') || code;
      await message.conn.sendMessage(message.from, {
        text: `✅ *Pairing Code:* \`${formatted}\`

🔹 Open WhatsApp → Settings → Linked Devices
🔹 Tap "Link with phone number"
🔹 Enter this code

⏰ Valid for 5 minutes

After pairing, this bot will work for *+${cleanNumber}* automatically!`
      });
      return; // success, exit
    } else {
      throw new Error(data.error || "API returned error");
    }
  } catch (err) {
    console.error("Pair API failed:", err.message);
    // Fallback: send links
    await message.conn.sendMessage(message.from, {
      text: `⚠️ Direct code generation failed temporarily.

🌐 Please use Web Pairing: ${WEB_URL}
🤖 Or use Telegram Bot: ${TG_BOT}

Simply enter your number there and get the code.`
    });
  }
});
