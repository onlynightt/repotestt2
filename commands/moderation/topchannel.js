
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: "topchannel",
  description: "Moves a text channel to the top of the server/category",
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

    try {
      await channel.setPosition(0);

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('⬆️ Channel Moved to Top')
        .addFields(
          { name: 'Channel', value: `${channel.name}`, inline: true },
          { name: 'Moderator', value: `${message.author.tag}`, inline: true }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply("❌ Failed to move the channel. Check my permissions.");
    }
  }
};
