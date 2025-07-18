
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: "announcement",
  description: "Send an announcement to a specific channel",
  category: "moderation",
  aliases: ["announce", "ann"],
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply("❌ You need Manage Messages permission to use this command.");
    }

    if (args.length < 2) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Invalid Usage')
        .setDescription(`Usage: \`${client.config.prefix}announcement <#channel> <message>\``)
        .addFields({ name: 'Example', value: `\`${client.config.prefix}announcement #general Hello everyone!\``, inline: false });
      return message.reply({ embeds: [embed] });
    }

    const channelMention = args[0];
    const announcementText = args.slice(1).join(' ');

    const channelId = channelMention.replace(/[<#>]/g, '');
    const targetChannel = message.guild.channels.cache.get(channelId);

    if (!targetChannel) {
      return message.reply("❌ Invalid channel. Please mention a valid channel.");
    }

    if (!targetChannel.permissionsFor(client.user).has(PermissionsBitField.Flags.SendMessages)) {
      return message.reply("❌ I don't have permission to send messages in that channel.");
    }

    try {
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('📢 Announcement')
        .setDescription(announcementText)
        .setFooter({ text: `Announced by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();

      await targetChannel.send({ embeds: [embed] });

      const confirmEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Announcement Sent')
        .setDescription(`Successfully sent announcement to ${targetChannel}`)
        .setTimestamp();

      message.reply({ embeds: [confirmEmbed] });

      // Log the action
      const logAction = require('../../utils/logger');
      await logAction(client, message.guild, {
        action: 'Announcement Sent',
        target: { tag: targetChannel.name, id: targetChannel.id },
        executor: message.author,
        reason: `Message: ${announcementText.substring(0, 100)}${announcementText.length > 100 ? '...' : ''}`
      });
    } catch (error) {
      console.error('Error sending announcement:', error);
      message.reply("❌ An error occurred while sending the announcement.");
    }
  }
};
