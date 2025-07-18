module.exports = {
    name: "avatar",
    aliases: ["a"],
    description: "View your avatar or another user's avatar",
    category: "public",
    async execute(client, message, args) {
        const user = message.mentions.users.first() || message.author;
        const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });

        const embed = {
            color: 0x00AE86,
            title: `🖼️ Avatar for ${user.tag}`,
            image: { url: avatarURL }
        };

        message.channel.send({ embeds: [embed] });
    }
};