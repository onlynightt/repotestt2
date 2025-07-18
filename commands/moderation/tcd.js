
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: "tcd",
  description: "Deletes a text channel by mention or ID",
  category: "moderation",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply("❌ You don't have permission to manage channels.");
    }

    const channel = message.mentions.channels.first() || 
                    message.guild.channels.cache.get(args[0]) ||
                    message.channel;

    if (!channel || channel.type !== 0) {
      return message.reply("❌ Please mention a text channel or provide its ID.");
    }

    const channelName = channel.name;

    try {
      await channel.delete();

      if (channel.id !== message.channel.id) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('🗑️ Text Channel Deleted')
          .addFields(
            { name: 'Channel', value: channelName, inline: true },
            { name: 'Moderator', value: `${message.author.tag}`, inline: true }
          )
          .setTimestamp();

        message.reply({ embeds: [embed] });
      }
    } catch (error) {
      message.reply("❌ Failed to delete the channel. Check my permissions.");
    }
  }
};
