
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "roll",
    aliases: ["dice", "r"],
    description: "Roll a dice (1-6) or specify sides",
    category: "public",
    async execute(client, message, args) {
        let sides = 6;
        
        if (args.length > 0) {
            const parsed = parseInt(args[0]);
            if (parsed && parsed > 1 && parsed <= 1000) {
                sides = parsed;
            } else if (parsed) {
                return message.reply("❌ Please provide a number between 2 and 1000 for dice sides.");
            }
        }

        const result = Math.floor(Math.random() * sides) + 1;

        const embed = new EmbedBuilder()
            .setTitle('🎲 Dice Roll')
            .addFields(
                { name: 'Dice', value: `D${sides}`, inline: true },
                { name: 'Result', value: `**${result}**`, inline: true }
            )
            .setColor('#FF6B6B')
            .setFooter({ text: `Rolled by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
