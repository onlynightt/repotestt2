const { EmbedBuilder } = require("discord.js");

function createEmbed(title, description, color = "Red") {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp();
}

module.exports = { createEmbed };