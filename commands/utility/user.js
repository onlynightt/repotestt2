module.exports = {
    name: "user",
    aliases: ["u"],
    description: "View when the user joined Discord and this server",
    category: "public",
    async execute(client, message, args) {
        const member = message.mentions.members.first() || message.member;
        const user = member.user;

        const embed = {
            color: 0x5865F2,
            author: {
                name: user.tag,
                icon_url: user.displayAvatarURL({ dynamic: true })
            },
            thumbnail: {
                url: user.displayAvatarURL({ dynamic: true })
            },
            fields: [
                {
                    name: "📆 Account Created",
                    value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
                    inline: true
                },
                {
                    name: "📅 Joined Server",
                    value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,
                    inline: true
                }
            ]
        };

        message.channel.send({ embeds: [embed] });
    }
};