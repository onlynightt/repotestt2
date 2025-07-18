
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: "slowmode",
  description: "Sets a slowmode duration for a channel",
  category: "moderation",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply("❌ You don't have permission to manage channels.");
    }

    const seconds = parseInt(args[0]);

    if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
      return message.reply("❌ Please specify a number between 0 and 21600 seconds (6 hours).");
    }

    try {
      await message.channel.setRateLimitPerUser(seconds);

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('⏰ Slowmode Updated')
        .addFields(
          { name: 'Channel', value: `${message.channel.name}`, inline: true },
          { name: 'Duration', value: `${seconds} seconds`, inline: true },
          { name: 'Moderator', value: `${message.author.tag}`, inline: true }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply("❌ Failed to set slowmode. Check my permissions.");
    }
  }
};
