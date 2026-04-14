import os from "os";
import { Module, getCommands } from "../lib/plugins.js";
import { getRandomPhoto } from "./bin/menu_img.js";
import config from "../config.js";

const readMore = String.fromCharCode(8206).repeat(4001);

function runtime(secs) {
  const pad = (s) => s.toString().padStart(2, "0");
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  return `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
}

function buildGroupedCommands() {
  const cmds = getCommands();
  return cmds
    .filter((cmd) => cmd && cmd.command && cmd.command !== "undefined")
    .reduce((acc, cmd) => {
      const pkg = (cmd.package || "uncategorized").toString().toLowerCase();
      if (!acc[pkg]) acc[pkg] = [];
      acc[pkg].push(cmd.command);
      return acc;
    }, {});
}

// ================== Rabbit-Style Menu with Channel Forward ==================
Module({
  command: "menu",
  package: "general",
  description: "Show all commands in Rabbit-style with channel forward",
})(async (message, match) => {
  try {
    await message.react("🎀");

    const time = new Date().toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
    const userName = message.pushName || "User";
    const usedGB = ((os.totalmem() - os.freemem()) / 1073741824).toFixed(2);
    const totGB = (os.totalmem() / 1073741824).toFixed(2);
    const ram = `${usedGB} / ${totGB} GB`;

    const grouped = buildGroupedCommands();
    const categories = Object.keys(grouped).sort();
    let _cmd_st = "";

    if (match && grouped[match.toLowerCase()]) {
      const pack = match.toLowerCase();
      _cmd_st += `\n╭──────────●●►\n`;
      grouped[pack].sort().forEach((cmdName) => {
        _cmd_st += ` *┃ *▢ . ${cmdName}*\n`;
      });
      _cmd_st += `╰──────────●●►\n`;
    } else {
      _cmd_st += `
🎀 *Ξ Ꭺᴋꫝꜱʜ - 𝐌ᴅ ا⚡ Ξ*
╭──────────●●►
┃ *▢ 𝐔sᴇʀ*: ${userName}
┃ *▢ 𝐏ʀᴇғɪx :* ${config.prefix}
┃ *▢ 𝐌ᴏᴅᴇ :* Public
┃ *▢ 𝐑ᴀᴍ :* ${ram}
┃ *▢ 𝐓ɪᴍᴇ :* ${time}
┃ *▢ 𝐑ᴜɴᴛɪᴍᴇ :* ${runtime(process.uptime())}
╰──────────●●►

${readMore}
`;

      for (const cat of categories) {
        _cmd_st += `\n╭──────────●●►\n`;
        grouped[cat].sort().forEach((cmdName) => {
          _cmd_st += `┃ *▢ . ${cmdName}*\n`;
        });
        _cmd_st += `╰──────────●●►\n`;
      }

      _cmd_st += `\n> 🎀 *Ξ Ꭺᴋꫝꜱʜ - 𝐌ᴅ ا⚡ Ꭺᴋꫝꜱʜ ᴍ*`;
    }

    const opts = {
      image: { url: "https://uploads.onecompiler.io/444ewq55c/44k3bc2jy/1000650778.jpg" },
      caption: _cmd_st,
      mimetype: "image/jpeg",
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363423210858654@newsletter",
          newsletterName: "Ꭺᴋꫝꜱʜ - 𝐌ᴅ",
          serverMessageId: 6,
        },
      },
    };

    await message.conn.sendMessage(message.from, opts);
  } catch (err) {
    console.error("❌ Menu command error:", err);
    await message.conn.sendMessage(message.from, {
      text: `❌ Error: ${err?.message || err}`,
    });
  }
});
