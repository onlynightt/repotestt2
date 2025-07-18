const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
} = require("discord.js");
const ms = require("ms");

module.exports = {
    name: "gstart",
    description: "Start a giveaway using button or reaction",
    category: "giveaway",
    ownerOnly: false,
    async execute(client, message, args) {
        await message.delete().catch(() => {});
        if (!message.member.permissions.has("ManageMessages"))
            return message.channel.send("❌ You need `Manage Messages` permission.").then(m => setTimeout(() => m.delete(), 5000));

        const method = args[0];
        const durationInput = args[1];
        const winnerCount = parseInt(args[2]);
        const prize = args.slice(3).join(" ");

        if (!["react", "button"].includes(method) || !durationInput || isNaN(winnerCount) || !prize) {
            return message.channel.send(`❌ Usage: \`${client.config.prefix}gstart <react/button> <duration> <winners> <prize>\``).then(m => setTimeout(() => m.delete(), 8000));
        }

        const duration = ms(durationInput);
        if (!duration) {
            return message.channel.send("❌ Invalid duration format. Use formats like: 1m, 1h, 1d").then(m => setTimeout(() => m.delete(), 5000));
        }

        const endTime = Date.now() + duration;

        const embed = new EmbedBuilder()
            .setTitle("🎉 Giveaway!")
            .setDescription(`**Prize:** ${prize}\n👥 **Winners:** ${winnerCount}\n⏰ **Ends:** <t:${Math.floor(endTime / 1000)}:R>`)
            .setColor("Gold")
            .setFooter({ text: `Giveaway started by ${message.author.tag}` });

        let giveawayMsg;

        if (method === "button") {
            const buttonRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("join_giveaway")
                    .setLabel("🎉 Join")
                    .setStyle(ButtonStyle.Primary)
            );

            giveawayMsg = await message.channel.send({ embeds: [embed], components: [buttonRow] });

            const participants = new Set();

            const collector = giveawayMsg.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: duration
            });

            collector.on("collect", i => {
                participants.add(i.user.id);
                i.reply({ content: "✅ You joined the giveaway!", ephemeral: true });
            });

            collector.on("end", async () => {
                const winners = [...participants].sort(() => 0.5 - Math.random()).slice(0, winnerCount);
                const winnerMentions = winners.map(id => `<@${id}>`).join(", ");

                const resultEmbed = EmbedBuilder.from(embed)
                    .setColor("Green")
                    .setTitle("🎊 Giveaway Ended!")
                    .setDescription(`**Prize:** ${prize}\n👥 **Winners:** ${winnerMentions || "No valid entries."}`)
                    .setFooter({ text: `Ended • ${message.author.tag}` });

                await giveawayMsg.edit({ embeds: [resultEmbed], components: [] });
                if (winners.length > 0) message.channel.send(`🎉 Congrats ${winnerMentions}, you won **${prize}**!`);
            });

        } else if (method === "react") {
            giveawayMsg = await message.channel.send({ embeds: [embed] });
            await giveawayMsg.react("🎉");

            setTimeout(async () => {
                try {
                    const updated = await giveawayMsg.fetch();
                    const reaction = updated.reactions.cache.get("🎉");
                    
                    if (!reaction) {
                        const resultEmbed = EmbedBuilder.from(embed)
                            .setColor("Red")
                            .setTitle("🎊 Giveaway Ended!")
                            .setDescription(`**Prize:** ${prize}\n👥 **Winners:** No valid entries.`)
                            .setFooter({ text: `Ended • ${message.author.tag}` });
                        
                        await giveawayMsg.edit({ embeds: [resultEmbed] });
                        return;
                    }

                    const users = await reaction.users.fetch();
                    const filtered = users.filter(u => !u.bot).map(u => u.id);
                    const winners = filtered.sort(() => 0.5 - Math.random()).slice(0, winnerCount);
                    const winnerMentions = winners.map(id => `<@${id}>`).join(", ");

                    const resultEmbed = EmbedBuilder.from(embed)
                        .setColor("Green")
                        .setTitle("🎊 Giveaway Ended!")
                        .setDescription(`**Prize:** ${prize}\n👥 **Winners:** ${winnerMentions || "No valid entries."}`)
                        .setFooter({ text: `Ended • ${message.author.tag}` });

                    await giveawayMsg.edit({ embeds: [resultEmbed] });
                    if (winners.length > 0) {
                        message.channel.send(`🎉 Congrats ${winnerMentions}, you won **${prize}**!`);
                    }
                } catch (error) {
                    console.error('Error ending giveaway:', error);
                }
            }, duration);
        }
    }
};