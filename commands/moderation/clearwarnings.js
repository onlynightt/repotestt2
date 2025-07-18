
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: "clearwarnings",
  description: "Clears all warnings for a user",
  category: "moderation",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("❌ You need Administrator permission to clear warnings.");
    }

    const target = message.mentions.members.first() || 
                   message.guild.members.cache.get(args[0]);
    
    if (!target) {
      return message.reply("❌ Please mention a user or provide their ID.");
    }

    let warnings = {};
    try {
      warnings = JSON.parse(fs.readFileSync('./data/warnings.json', 'utf8'));
    } catch (error) {
      warnings = {};
    }

    const userWarnings = warnings[target.id] || [];
    const warningCount = userWarnings.length;

    if (warningCount === 0) {
      return message.reply(`✅ ${target.user.tag} has no warnings to clear.`);
    }

    delete warnings[target.id];
    fs.writeFileSync('./data/warnings.json', JSON.stringify(warnings, null, 2));

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('✅ Warnings Cleared')
      .addFields(
        { name: 'User', value: `${target.user.tag} (${target.id})`, inline: true },
        { name: 'Moderator', value: `${message.author.tag}`, inline: true },
        { name: 'Warnings Cleared', value: `${warningCount}`, inline: true }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
