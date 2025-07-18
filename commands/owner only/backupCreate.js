const fs = require("fs");
const path = require("path");
const { ChannelType, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "backupcreate",
  description: "Create a backup of the current server",
  category: "ServerBackup",
  ownerOnly: true,
  async execute(client, message) {
    if (message.author.id !== client.config.ownerId)
      return message.reply("❌ Only the bot owner can use this command.");

    const guild = message.guild;
    await guild.members.fetch();

    const backup = {
      guildName: guild.name,
      iconURL: guild.iconURL({ extension: "png" }),
      bannerURL: guild.bannerURL({ extension: "png" }),
      roles: [],
      channels: [],
      emojis: []
    };

    const roles = [...guild.roles.cache.values()]
      .filter(r => r.name !== "@everyone" && !r.managed) // skip @everyone and bot roles
      .sort((a, b) => b.position - a.position);

    for (const role of roles) {
      backup.roles.push({
        name: role.name,
        color: role.hexColor,
        hoist: role.hoist,
        permissions: role.permissions.bitfield.toString(),
        mentionable: role.mentionable,
        position: role.position
      });
    }

    const channels = [...guild.channels.cache.values()].sort((a, b) => a.position - b.position);
    for (const channel of channels) {
      const data = {
        name: channel.name,
        type: channel.type,
        parent: channel.parent?.name || null,
        position: channel.position,
        permissionOverwrites: []
      };

      if (channel.type === ChannelType.GuildText) {
        data.topic = channel.topic || null;
        data.nsfw = channel.nsfw;
        data.rateLimitPerUser = channel.rateLimitPerUser;
      }

      for (const overwrite of channel.permissionOverwrites.cache.values()) {
        data.permissionOverwrites.push({
          id: overwrite.id,
          allow: overwrite.allow.bitfield.toString(),
          deny: overwrite.deny.bitfield.toString(),
          type: overwrite.type
        });
      }

      backup.channels.push(data);
    }

    for (const emoji of guild.emojis.cache.values()) {
      backup.emojis.push({
        name: emoji.name,
        url: emoji.url
      });
    }

    const filePath = path.join(__dirname, "..", "data", "backups.json");
    let backups = {};
    if (fs.existsSync(filePath)) {
      backups = JSON.parse(fs.readFileSync(filePath));
    }

    const backupId = Date.now().toString();
    backups[backupId] = backup;

    fs.writeFileSync(filePath, JSON.stringify(backups, null, 2));
    message.reply(`✅ Backup created with ID: \`${backupId}\``);
  }
};