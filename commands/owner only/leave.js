module.exports = {
  name: "leave",
  description: "Make the bot leave a server (current or specified)",
  category: "OwnerOnly",
  ownerOnly: true,
  async execute(client, message, args) {
    const targetId = args[0];

    if (!targetId) {
      await message.guild.leave();
      return;
    }

    const targetGuild = client.guilds.cache.get(targetId);
    if (!targetGuild) return message.reply("❌ Bot is not in that server.");

    try {
      await targetGuild.leave();
      message.reply(`✅ Left the server: **${targetGuild.name}**`);
    } catch (err) {
      console.error(err);
      message.reply("❌ Failed to leave the specified server.");
    }
  }
};