
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: "lock",
  description: "Locks a channel (disables sending messages)",
  category: "moderation",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply("❌ You don't have permission to manage channels.");
    }

    const channel = message.mentions.channels.first() || message.channel;

    try {
      await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: false
      });

      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🔒 Channel Locked')
        .addFields(
          { name: 'Channel', value: `${channel.name}`, inline: true },
          { name: 'Moderator', value: `${message.author.tag}`, inline: true }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply("❌ Failed to lock the channel. Check my permissions.");
    }
  }
};
