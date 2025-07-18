
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: "unlock",
  description: "Unlocks a previously locked channel",
  category: "moderation",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply("❌ You don't have permission to manage channels.");
    }

    const channel = message.mentions.channels.first() || message.channel;

    try {
      await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: null
      });

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('🔓 Channel Unlocked')
        .addFields(
          { name: 'Channel', value: `${channel.name}`, inline: true },
          { name: 'Moderator', value: `${message.author.tag}`, inline: true }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply("❌ Failed to unlock the channel. Check my permissions.");
    }
  }
};
