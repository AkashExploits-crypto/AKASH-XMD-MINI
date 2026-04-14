import { Module } from '../lib/plugins.js';

Module({
  command: "pair",
  package: "main",
  description: "Pair your WhatsApp number with this bot",
})(async (message, match) => {
  // match can be string or array; handle both
  let number = null;
  if (typeof match === 'string') {
    number = match.trim();
  } else if (Array.isArray(match) && match.length > 0) {
    number = match[0] ? match[0].trim() : null;
  } else {
    number = null;
  }

  const WEB_URL = "https://akash-xmd-mini.onrender.com/";
  const TG_BOT = "https://t.me/AKASH_MINI_BOT";

  // If no number provided, show help
  if (!number || number === "") {
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

  // Clean number: remove any non-digit (including +, spaces, dashes)
  let cleanNumber = number.replace(/\D/g, '');
  
  // Validate length (10-15 digits)
  if (cleanNumber.length < 10 || cleanNumber.length > 15) {
    await message.conn.sendMessage(message.from, {
      text: `❌ Invalid number: ${number}\nUse country code without '+' (e.g., 919876543210)\nTry: .pair 919876543210`
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
      return;
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
