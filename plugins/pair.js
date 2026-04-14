import { Module } from '../lib/plugins.js';

Module({
  command: "pair",
  package: "main",
  description: "Generate WhatsApp pairing code using AKASH XMD MINI API",
})(async (message, match) => {
  try {
    // match = full message text (e.g., ".pair 919876543210")
    const args = match?.trim().split(/\s+/);
    const numberArg = args?.[1];

    // No number provided → show usage guide
    if (!numberArg) {
      const usageMsg = `
╭━━━「 🐉✨ 𝐀𝐊𝐀𝐒𝐇 𝐗𝐌𝐃 𝐌𝐈𝐍𝐈 ✨🐉 」━━━┈⊷
┃
┃  𝐇𝐨𝐰 𝐭𝐨 𝐏𝐚𝐢𝐫 𝐘𝐨𝐮𝐫 𝐃𝐞𝐯𝐢𝐜𝐞
┃
┃  🌟 *Command:* \`.pair 919876543210\`
┃  📌 *Example:* \`.pair 911234567890\`
┃
┃  ⚡ After entering the code in WhatsApp,
┃     your bot session will be ready!
┃
┃  🔗 *Need help?* Contact @Akash_Exploits_bot
┃
╰━━━━━━━━━━━━━━━━━━━━┈⊷
      `.trim();

      const opts = {
        text: usageMsg,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363423210858654@newsletter",
            newsletterName: "Ꭺᴋꫝꜱʜ Xᴍᴅ",
            serverMessageId: 6,
          },
        },
      };
      await message.conn.sendMessage(message.from, opts);
      return;
    }

    // Clean phone number (digits only)
    let phoneNumber = numberArg.replace(/[^0-9]/g, '');
    if (!phoneNumber || phoneNumber.length < 8) {
      await message.conn.sendMessage(message.from, {
        text: `❌ *Invalid Number!*\n\nPlease provide a valid WhatsApp number with country code.\n✅ Correct format: \`.pair 919876543210\``
      });
      return;
    }

    // Call your pairing API
    const API_URL = process.env.PAIR_API_URL || 'https://akash-xmd-mini.onrender.com';
    const response = await fetch(`${API_URL}/pair/${phoneNumber}/`);
    const data = await response.json();

    if (!data.ok || !data.code) {
      throw new Error(data.error || 'Pairing failed');
    }

    // Format code in groups of 4 (e.g., A1B2-C3D4)
    const rawCode = data.code;
    const formattedCode = rawCode.match(/.{1,4}/g)?.join('-') || rawCode;

    // Beautiful response message
    const successMsg = `
╭━━━━「 🐉✨ 𝐀𝐊𝐀𝐒𝐇 𝐗𝐌𝐃 𝐌𝐈𝐍𝐈 ✨🐉 」━━━━┈⊷
┃
┃  ✅ *Pairing Code Generated!*
┃
┃  📞 *Number:* +${phoneNumber}
┃  🔑 *Code:* \`${formattedCode}\`
┃
┃  📝 *How to pair:*
┃  1️⃣ Open WhatsApp → Settings / Linked Devices
┃  2️⃣ Tap "Link with phone number"
┃  3️⃣ Enter this code: *${formattedCode}*
┃
┃  ⏱️ *Code expires in 5 minutes.*
┃  🔒 *Secure & seamless pairing*
┃
┃  🚀 *Powered by AKASH XMD MINI*
╰━━━━━━━━━━━━━━━━━━━━━━┈⊷
    `.trim();

    const opts = {
      text: successMsg,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363423210858654@newsletter",
          newsletterName: "Ꭺᴋꫝꜱʜ Xᴍᴅ",
          serverMessageId: 6,
        },
      },
    };

    await message.conn.sendMessage(message.from, opts);
  } catch (err) {
    console.error("❌ Pair command error:", err);
    await message.conn.sendMessage(message.from, {
      text: `❌ *Pairing Failed*\n\n${err?.message || 'Unknown error. Please try again later.'}`
    });
  }
});
