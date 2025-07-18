
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "choose",
    aliases: ["pick", "select"],
    description: "Choose randomly between multiple options",
    category: "public",
    async execute(client, message, args) {
        if (args.length < 2) {
            return message.reply("❌ Please provide at least 2 options separated by spaces. Example: `choose pizza burger tacos`");
        }

        const options = args;
        const choice = options[Math.floor(Math.random() * options.length)];

        const embed = new EmbedBuilder()
            .setTitle('🎲 Random Choice')
            .addFields(
                { name: 'Options', value: options.map(opt => `• ${opt}`).join('\n'), inline: false },
                { name: 'My Choice', value: `**${choice}**`, inline: false }
            )
            .setColor('#9932CC')
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
