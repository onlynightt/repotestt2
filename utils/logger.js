const { EmbedBuilder } = require("discord.js");
const { getSettings } = require("./settings");

module.exports = async function logAction(client, guild, data) {
  const settings = getSettings(guild.id);
  const logChannel = settings.logChannel ? guild.channels.cache.get(settings.logChannel) : null;

  if (!logChannel) return;

  const embed = new EmbedBuilder()
    .setTitle(`🔒 ${data.action}`)
    .addFields(
      { name: "User", value: `${data.target.tag} (${data.target.id})`, inline: true },
      { name: "By", value: `${data.executor.tag} (${data.executor.id})`, inline: true },
      { name: "Reason", value: data.reason || "No reason given" }
    )
    .setTimestamp()
    .setColor("Red");

  await logChannel.send({ embeds: [embed] });
};