// plugins/pair.js - Public Pairing Command
export default {
  name: "pair",
  category: "general",   // 'general' means everyone can use
  description: "Generate WhatsApp pairing code for any number",
  async exec({ sock, m, args, manager }) {
    // Get phone number from arguments
    let phoneNumber = args[0];
    
    if (!phoneNumber) {
      await m.reply(`╭━━━「 🐉✨ 𝐀𝐊𝐀𝐒𝐇 𝐗𝐌𝐃 𝐌𝐈𝐍𝐈 ✨🐉 」━━━┈⊷
┃
┃  𝐇𝐨𝐰 𝐭𝐨 𝐏𝐚𝐢𝐫 𝐘𝐨𝐮𝐫 𝐃𝐞𝐯𝐢𝐜𝐞
┃
┃  🌟 *Command:* .pair 919876543210
┃  📌 *Example:* .pair 911234567890
┃
┃  ⚡ After entering the code in WhatsApp,
┃     your bot session will be ready!
┃
┃  🔗 *Need help?* Contact @Akash_Exploits_bot
┃
╰━━━━━━━━━━━━━━━━━━━━┈⊷`);
      return;
    }
    
    // Clean number: remove any non-digit and ensure it starts with country code
    let cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.length < 10 || cleanNumber.length > 15) {
      await m.reply("❌ Invalid number! Please enter a valid phone number with country code (e.g., 919876543210)");
      return;
    }
    
    await m.reply(`⏳ Requesting pairing code for *+${cleanNumber}*...\n\nPlease wait a few seconds.`);
    
    try {
      // Get or start a socket for this number
      let pairingSock = manager.getSock(cleanNumber);
      if (!pairingSock) {
        pairingSock = await manager.start(cleanNumber);
      }
      
      // Wait a bit for socket to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (!pairingSock || typeof pairingSock.requestPairingCode !== 'function') {
        throw new Error("Pairing not supported by this socket version");
      }
      
      // Request pairing code from WhatsApp
      const pairingCode = await pairingSock.requestPairingCode(cleanNumber);
      
      // Format code in groups of 3 or 4 for readability
      let formattedCode = pairingCode.match(/.{1,4}/g)?.join('-') || pairingCode;
      
      await m.reply(`╭━━━「 🐉✨ 𝐀𝐊𝐀𝐒𝐇 𝐗𝐌𝐃 𝐌𝐈𝐍𝐈 ✨🐉 」━━━┈⊷
┃
┃  ✅ *Pairing Code Generated!*
┃
┃  🔢 *Code:* ${formattedCode}
┃  📱 *Number:* +${cleanNumber}
┃
┃  *How to use:*
┃  1. Open WhatsApp on your phone
┃  2. Go to Settings → Linked Devices
┃  3. Tap "Link with phone number"
┃  4. Enter this code
┃
┃  ⏰ *Code expires in 5 minutes*
┃
┃  🔗 Need help? @Akash_Exploits_bot
┃
╰━━━━━━━━━━━━━━━━━━━━┈⊷`);
      
      // Auto cleanup after 5 minutes? Optional: set a timer to stop the session if not used
      setTimeout(async () => {
        try {
          // Check if session is still unused, then stop it (optional)
          // For now just log
          console.log(`Pairing session for +${cleanNumber} expired.`);
        } catch (e) {}
      }, 5 * 60 * 1000);
      
    } catch (error) {
      console.error("Pairing command error:", error);
      await m.reply(`❌ Failed to generate pairing code.\n\n*Error:* ${error.message}\n\nPlease try again later or use the web pairing page.`);
    }
  }
};
