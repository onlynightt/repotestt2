
const { PermissionsBitField, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
  name: "tcc",
  description: "Creates a text channel with a specified name",
  category: "moderation",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply("❌ You don't have permission to manage channels.");
    }

    if (!args[0]) {
      return message.reply("❌ Please specify a channel name.");
    }

    const channelName = args.join('-').toLowerCase();

    if (message.guild.channels.cache.find(c => c.name === channelName)) {
      return message.reply("❌ A channel with that name already exists.");
    }

    try {
      const channel = await message.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        reason: `Channel created by ${message.author.tag}`
      });

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Text Channel Created')
        .addFields(
          { name: 'Channel', value: `${channel.name} (${channel.id})`, inline: true },
          { name: 'Creator', value: `${message.author.tag}`, inline: true }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply("❌ Failed to create the channel. Check my permissions.");
    }
  }
};
