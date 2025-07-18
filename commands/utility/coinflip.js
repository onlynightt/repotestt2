
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "coinflip",
    aliases: ["flip", "coin"],
    description: "Flip a coin and get heads or tails",
    category: "public",
    async execute(client, message, args) {
        const outcomes = ['Heads', 'Tails'];
        const result = outcomes[Math.floor(Math.random() * outcomes.length)];
        const emoji = result === 'Heads' ? '🪙' : '🔄';

        const embed = new EmbedBuilder()
            .setTitle(`${emoji} Coin Flip Result`)
            .setDescription(`**${result}!**`)
            .setColor(result === 'Heads' ? '#FFD700' : '#C0C0C0')
            .setFooter({ text: `Flipped by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
