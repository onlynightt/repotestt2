
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: "untimeout",
  description: "Removes timeout from a user",
  category: "moderation",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply("❌ You don't have permission to remove timeouts.");
    }

    const target = message.mentions.members.first() || 
                   message.guild.members.cache.get(args[0]);
    
    if (!target) {
      return message.reply("❌ Please mention a user or provide their ID.");
    }

    if (!target.isCommunicationDisabled()) {
      return message.reply("❌ This user is not timed out.");
    }

    try {
      await target.timeout(null);

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('🔊 Timeout Removed')
        .addFields(
          { name: 'User', value: `${target.user.tag} (${target.id})`, inline: true },
          { name: 'Moderator', value: `${message.author.tag}`, inline: true }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply("❌ Failed to remove timeout. Check my permissions and role hierarchy.");
    }
  }
};
