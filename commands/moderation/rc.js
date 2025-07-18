
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: "rc",
  description: "Creates a new role with a given name",
  category: "moderation",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return message.reply("❌ You don't have permission to manage roles.");
    }

    if (!args[0]) {
      return message.reply("❌ Please specify a role name.");
    }

    const roleName = args.join(' ');

    if (message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase())) {
      return message.reply("❌ A role with that name already exists.");
    }

    try {
      const role = await message.guild.roles.create({
        name: roleName,
        reason: `Role created by ${message.author.tag}`
      });

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Role Created')
        .addFields(
          { name: 'Role', value: `${role.name} (${role.id})`, inline: true },
          { name: 'Creator', value: `${message.author.tag}`, inline: true }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply("❌ Failed to create the role. Check my permissions.");
    }
  }
};
