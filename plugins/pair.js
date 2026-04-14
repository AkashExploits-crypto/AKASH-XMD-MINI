import { Module } from '../lib/plugins.js';

Module({
  command: "pair",
  package: "main",
  description: "Instruct user to pair via Telegram Bot with fixed image",
})(async (message, match) => {
  try {
    const _cmd_st = `
╭━━━「 💜🦋💗 𝐏𝐀𝐈𝐑 𝐒𝐄𝐓𝐓𝐈𝐍𝐆𝐒 💗🦋💜 」━━━┈⊷
┃
┃ 𝐇ᴇʟʟᴏ 𝐋ᴏᴠᴇʟʏ 𝐔sᴇʀ! 🦋💖
┃
┃ 🌸 𝐏ᴀɪʀ ʏᴏᴜʀ ɴᴜᴍʙᴇʀ ᴠɪᴀ 𝐓ᴇʟᴇɢʀᴀᴍ 𝐁ᴏᴛ 🌸
┃ 🔗 https://t.me/AKASH_MINI_BOT
┃ 🎀 𝐄ɴᴊᴏʏ ʏᴏᴜʀ ʙᴏᴛ 𝐄xᴘᴇʀɪᴇɴᴄᴇ! 🌷🦋💜
╰━━━━━━━━━━━━━━━━━━━━┈⊷
    `.trim();

    const opts = {
      image: { url: "https://uploads.onecompiler.io/444ewq55c/44k3bc2jy/1000650778.jpg" },
      caption: _cmd_st,
      mimetype: "image/jpeg",
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
      text: `❌ Error: ${err?.message || err}`,
    });
  }
});
