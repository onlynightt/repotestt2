const fs = require("fs");
const path = require("path");
const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ChannelType,
  PermissionsBitField,
} = require("discord.js");

module.exports = {
  name: "backupload",
  description: "Load a server structure backup by ID",
  category: "OwnerOnly",
  ownerOnly: true,
  async execute(client, message, args) {
    if (message.author.id !== client.config.ownerId)
      return message.reply("❌ Only the bot owner can use this command.");

    const backupId = args[0];
    if (!backupId) return message.reply("❌ Please provide a backup ID.");

    const filePath = path.join(__dirname, "..", "data", "backups.json");
    if (!fs.existsSync(filePath)) return message.reply("❌ No backups found.");

    const backups = JSON.parse(fs.readFileSync(filePath));
    const backup = backups[backupId];
    if (!backup) return message.reply("❌ Backup ID not found.");

    let options = {
      roles: true,
      channels: true,
      emojis: true,
      settings: true,
    };

    const generateSummary = () => {
      let summary = `⚙️ **Clone Settings**\n`;
      for (const [key, enabled] of Object.entries(options)) {
        summary += `• ${enabled ? "✅" : "❌"} ${key.charAt(0).toUpperCase() + key.slice(1)}\n`;
      }
      summary += `\n📊 **Pending Changes**\n`;
      if (options.roles) summary += `• Roles to create: ${backup.roles.length}\n`;
      if (options.channels) summary += `• Channels to create: ${backup.channels.length}\n`;
      if (options.emojis) summary += `• Emojis will be cloned (if within limits)\n`;
      if (options.settings) summary += `• Server name, icon, banner, and settings will be applied\n`;
      return summary;
    };

    const embed = new EmbedBuilder()
      .setTitle("🧩 Confirm Backup Restoration")
      .setColor(0x5865f2)
      .setDescription(generateSummary())
      .setFooter({ text: `Backup ID: ${backupId}` });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("backup_options")
      .setPlaceholder("Toggle parts of the backup to apply")
      .setMinValues(0)
      .setMaxValues(4)
      .addOptions([
        { label: "Roles", value: "roles", default: true },
        { label: "Channels", value: "channels", default: true },
        { label: "Emojis", value: "emojis", default: true },
        { label: "Server Settings", value: "settings", default: true },
      ]);

    const rowSelect = new ActionRowBuilder().addComponents(selectMenu);
    const rowButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("confirm_restore")
        .setLabel("✅ Confirm")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("cancel_restore")
        .setLabel("❌ Cancel")
        .setStyle(ButtonStyle.Danger)
    );

    const sentMessage = await message.channel.send({
      embeds: [embed],
      components: [rowSelect, rowButtons],
    });

    const collector = sentMessage.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
      time: 60000,
    });

    collector.on("collect", async (interaction) => {
      if (interaction.customId === "backup_options") {
        options = {
          roles: interaction.values.includes("roles"),
          channels: interaction.values.includes("channels"),
          emojis: interaction.values.includes("emojis"),
          settings: interaction.values.includes("settings"),
        };
        await interaction.update({
          embeds: [embed.setDescription(generateSummary())],
          components: [rowSelect, rowButtons],
        });
      } else if (interaction.customId === "cancel_restore") {
        await interaction.update({
          content: "❌ Backup restoration cancelled.",
          embeds: [],
          components: [],
        });
        collector.stop();
      } else if (interaction.customId === "confirm_restore") {
        await interaction.update({
          content: "🔧 Restoring backup... Please wait.",
          embeds: [],
          components: [],
        });
        collector.stop();

        const guild = message.guild;

        if (options.channels) {
          const channels = await guild.channels.fetch();
          for (const channel of channels.values()) {
            await channel.delete().catch(() => {});
          }
        }

        if (options.roles) {
          const roles = await guild.roles.fetch();
          for (const role of roles.values()) {
            if (role.name !== "@everyone" && !role.managed) {
              await role.delete().catch(() => {});
            }
          }

          for (const roleData of backup.roles.sort((a, b) => b.position - a.position)) {
            await guild.roles.create({
              name: roleData.name,
              color: roleData.color,
              hoist: roleData.hoist,
              permissions: PermissionsBitField.resolve(roleData.permissions),
              mentionable: roleData.mentionable,
              position: roleData.position,
            }).catch(() => {});
          }
        }

        if (options.channels) {
          const categoryMap = new Map();

          for (const data of backup.channels.filter(c => c.type === ChannelType.GuildCategory)) {
            const cat = await guild.channels.create({
              name: data.name,
              type: ChannelType.GuildCategory,
              position: data.position
            }).catch(() => {});
            if (cat) categoryMap.set(data.name, cat.id);
          }

          for (const data of backup.channels.filter(c => c.type !== ChannelType.GuildCategory)) {
            await guild.channels.create({
              name: data.name,
              type: data.type,
              topic: data.topic || null,
              nsfw: data.nsfw || false,
              rateLimitPerUser: data.rateLimitPerUser || 0,
              parent: data.parent ? categoryMap.get(data.parent) || null : null,
              position: data.position,
              permissionOverwrites: data.permissionOverwrites?.map(po => ({
                id: po.id,
                allow: PermissionsBitField.resolve(po.allow),
                deny: PermissionsBitField.resolve(po.deny),
                type: po.type
              })) || []
            }).catch(() => {});
          }
        }

        if (options.settings) {
          try {
            if (backup.guildName) await guild.setName(backup.guildName);
            if (backup.iconURL) await guild.setIcon(backup.iconURL);
            if (backup.bannerURL) await guild.setBanner(backup.bannerURL);
          } catch (e) {}
        }

        if (options.emojis && guild.emojis.cache.size < 50) {
          for (const emoji of backup.emojis || []) {
            try {
              await guild.emojis.create(emoji.url, emoji.name);
            } catch (e) {}
          }
        }

        console.log("✅ Backup successfully restored.");
      }
    });

    collector.on("end", () => {
      sentMessage.edit({ components: [] }).catch(() => {});
    });
  },
};