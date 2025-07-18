
const { EmbedBuilder } = require('discord.js');

const jokes = [
    "Why don't scientists trust atoms? Because they make up everything!",
    "Why did the scarecrow win an award? He was outstanding in his field!",
    "Why don't eggs tell jokes? They'd crack each other up!",
    "What do you call a fake noodle? An impasta!",
    "Why did the math book look so sad? Because it had too many problems!",
    "What do you call a bear with no teeth? A gummy bear!",
    "Why don't some couples go to the gym? Because some relationships don't work out!",
    "What did the ocean say to the beach? Nothing, it just waved!",
    "Why do bees have sticky hair? Because they use honeycombs!",
    "What's orange and sounds like a parrot? A carrot!"
];

module.exports = {
    name: "joke",
    aliases: ["j", "funny"],
    description: "Get a random joke",
    category: "public",
    async execute(client, message, args) {
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];

        const embed = new EmbedBuilder()
            .setTitle('😂 Random Joke')
            .setDescription(randomJoke)
            .setColor('#FFD700')
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
