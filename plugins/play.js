import axios from "axios";
import yts from "yt-search";
import { Module } from "../lib/plugins.js";

Module({
  command: "play",
  package: "youtube",
  description: "Play song from YouTube (API based)",
})(async (message, match) => {
  try {
    if (!match) {
      return message.send("*❌ 𝐄ɴᴛᴇʀ 𝐒ᴏɴɢ 𝐍ᴀᴍᴇ*\n\n*𝐄xᴇᴍᴘʟᴇ: .play tun hi ho*");
    }

    await message.react("🔍");

    // 1️⃣ YouTube search
    const res = await yts(match);
    if (!res.videos || res.videos.length === 0) {
      return message.send("*❌ 𝐍ᴏ 𝐒ᴏɴɢ 𝐅ᴏᴜɴᴅ*");
    }

    const video = res.videos[0];

    // 2️⃣ Caption (WITH Powered By)
    const caption = `
╭────( 𝐏ʟᴀʏ !🎶)──────◇
┃ ᴛɪᴛʟᴇ: ${video.title}
┃ᴄʜᴀɴɴᴇʟ: ${video.author.name}
┃ ᴅᴜʀᴀᴛɪᴏɴ: ${video.timestamp}
╰──────────────◇
  > Ꭺᴋꫝꜱʜ-𝐗/𝐌𝐈𝐍𝐈 🕊️🌻💗`.trim();

    // 3️⃣ opts (YouTube thumbnail ব্যবহার হবে)
    const opts = {
      image: { url: video.thumbnail },
      caption: caption,
      mimetype: "image/jpeg",
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363423210858654@newsletter",
          newsletterName: "Ξ Ꭺᴋꫝꜱʜ - 𝐌ᴅ",
          serverMessageId: 6,
        },
      },
    };

    // ✅ Send Now Playing message (এখানেই একবারই পাঠাবে)
    await message.send(opts);

    // 4️⃣ Call your API with YouTube link
    const apiUrl =
      "https://api-aswin-sparky.koyeb.app/api/downloader/song?search=" +
      encodeURIComponent(video.url);

    const { data } = await axios.get(apiUrl, { timeout: 30000 });

    if (!data || !data.status || !data.data?.url) {
      return message.send("❌ Audio download failed");
    }

    // 5️⃣ Send audio
    await message.send({
      audio: { url: data.data.url },
      mimetype: "audio/mpeg",
      fileName: `${data.data.title || video.title}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: data.data.title || video.title,
          body: "🌷🎀",
          mediaType: 2,
          sourceUrl: video.url,
          thumbnailUrl: video.thumbnail,
        },
      },
    });

    await message.react("🎧");

  } catch (err) {
    console.error("[PLAY ERROR]", err);
    await message.send("⚠️ Play failed");
  }
});
