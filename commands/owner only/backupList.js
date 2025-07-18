const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "backuplist",
  description: "List all saved backups",
  category: "OwnerOnly",
  ownerOnly: true,
  async execute(client, message) {
    if (message.author.id !== client.config.ownerId)
      return message.reply("❌ Only the bot owner can use this command.");

    const filePath = path.join(__dirname, "..", "data", "backups.json");
    if (!fs.existsSync(filePath)) return message.reply("❌ No backups found.");

    const backups = JSON.parse(fs.readFileSync(filePath));
    const entries = Object.entries(backups);

    if (entries.length === 0) return message.reply("❌ No backups stored.");

    const maxDisplay = 20;
    const displayed = entries.slice(0, maxDisplay);

    const embed = new EmbedBuilder()
      .setTitle("💾 Saved Backups")
      .setColor(0x5865f2)
      .setDescription(
        displayed
          .map(([id, data]) => `\`${id}\` - **${data.guildName || "Unknown"}**`)
          .join("\n")
      )
      .setFooter({ text: `Showing ${displayed.length} of ${entries.length} backups` });

    if (entries.length > maxDisplay) {
      embed.addFields({ name: "Note", value: "Only the first 20 backups are shown." });
    }

    await message.channel.send({ embeds: [embed] });
  },
};