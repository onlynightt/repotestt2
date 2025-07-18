
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: "unmute",
  description: "Removes the 'Muted' role from a user",
  category: "moderation",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply("❌ You don't have permission to unmute members.");
    }

    const target = message.mentions.members.first() || 
                   message.guild.members.cache.get(args[0]);
    
    if (!target) {
      return message.reply("❌ Please mention a user or provide their ID.");
    }

    let muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');
    
    if (!muteRole) {
      return message.reply("❌ Muted role not found.");
    }

    if (!target.roles.cache.has(muteRole.id)) {
      return message.reply("❌ This user is not muted.");
    }

    try {
      await target.roles.remove(muteRole);

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('🔊 Member Unmuted')
        .addFields(
          { name: 'User', value: `${target.user.tag} (${target.id})`, inline: true },
          { name: 'Moderator', value: `${message.author.tag}`, inline: true }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply("❌ Failed to unmute the user. Check my permissions and role hierarchy.");
    }
  }
};
