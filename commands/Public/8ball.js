const { EmbedBuilder } = require("discord.js");

const responses = [
    "It is certain.",
    "Without a doubt.",
    "You may rely on it.",
    "Yes – definitely.",
    "Most likely.",
    "Outlook good.",
    "Signs point to yes.",
    "Reply hazy, try again.",
    "Ask again later.",
    "Better not tell you now.",
    "Cannot predict now.",
    "Concentrate and ask again.",
    "Don't count on it.",
    "My reply is no.",
    "My sources say no.",
    "Outlook not so good.",
    "Very doubtful."
];

module.exports = {
    name: "8ball",
    description: "Ask the magic 8-ball a yes/no question",
    aliases: ["eightball"],
    category: "public",
    ownerOnly: false,
    async execute(client, message, args) {
        if (!args.length) return message.reply("❌ Please ask a question.");

        const question = args.join(" ");
        const answer = responses[Math.floor(Math.random() * responses.length)];

        const embed = new EmbedBuilder()
            .setTitle("🎱 Magic 8-Ball")
            .addFields(
                { name: "Question", value: question },
                { name: "Answer", value: answer }
            )
            .setColor("Purple")
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};