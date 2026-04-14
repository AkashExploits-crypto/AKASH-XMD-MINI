import { Module } from "../lib/plugins.js";

Module({
  command: "ping",
  package: "mics",
  description: "Replies with the bot latency",
})(async (message) => {
  const start = Date.now();
  // Contact-style quote
  let gift = {
    key: {
      fromMe: false,
      participant: `0@s.whatsapp.net`,
      remoteJid: "status@broadcast",
    },
    message: {
      contactMessage: {
        displayName: "Ꭺᴋꫝꜱʜ",
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;a,;;;\nFN:'DEMON'\nitem1.TEL;waid=${
          message.conn.user.id.split("@")[0]
        }:${
          message.conn.user.id.split("@")[0]
        }\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
      },
    },
  };
  const emojis = [
    "⛅",
    "👻",
    "⛄",
    "👀",
    "🪁",
    "🪃",
    "🎳",
    "🎀",
    "🌸",
    "🍥",
    "🎀",
    "🍓",
    "🍡",
    "💗",
    "🦋",
    "💫",
    "💀",
    "☁️",
    "🌨️",
    "🌧️",
    "🌦️",
    "🌥️",
    "⛅",
    "🪹",
    "⚡",
    "🌟",
    "☁️",
    "🎐",
    "🏖️",
    "🎐",
    "🪺",
    "🌊",
    "🐚",
    "🪸",
    "🍒",
    "🍇",
    "🍉",
    "🌻",
    "🎢",
    "🚀",
    "🍫",
    "💎",
    "🌋",
    "🏔️",
    "⛰️",
    "🌙",
    "🪐",
    "🌲",
    "🍃",
    "🍂",
    "🍁",
    "🪵",
    "🍄",
    "🌿",
    "🐞",
    "🐍",
    "🕊️",
    "🎃",
    "🏟️",
    "🎡",
    "🥂",
    "🗿",
    "⛩️",
  ];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  await message.react(emoji);
  // const sent = await message.send("🏓 Pong...");
  const latency = Date.now() - start;
  //await message.send(`*${emoji}⧫𝐏❍ɴ𝖌་ : ${latency} ᴍٰ𝐬*`, { edit: sent.key });

  await message.conn.sendMessage(
    message.from,
    {
      text: `*${emoji}⧫𝐏❍ɴ𝖌་ : ${latency} ᴍٰ𝐬*`,
      contextInfo: {
        mentionedJid: [message.sender],
        forwardingScore: 5,
        isForwarded: false,
      },
    },
    { quoted: gift }
  );
});
