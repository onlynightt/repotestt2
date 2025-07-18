const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: "roles",
    description: "List all server roles with member count",
    category: "public",
    async execute(client, message) {
        const roles = message.guild.roles.cache
            .filter(role => role.name !== "@everyone")
            .sort((a, b) => b.position - a.position)
            .map(role => `🔹 ${role} (ID: \`${role.id}\`) — ${role.members.size} members`);

        if (roles.length === 0) return message.reply("❌ No roles found.");

        const chunkSize = 10;
        const pages = [];
        for (let i = 0; i < roles.length; i += chunkSize) {
            pages.push(roles.slice(i, i + chunkSize));
        }

        let page = 0;

        const getEmbed = (pageIndex) => {
            return new EmbedBuilder()
                .setTitle("📜 Server Roles")
                .setDescription(pages[pageIndex].join("\n"))
                .setFooter({ text: `Page ${pageIndex + 1} of ${pages.length}` })
                .setColor("Blurple");
        };

        const getButtons = (pageIndex) => {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("prev_roles")
                    .setLabel("⬅ Previous")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(pageIndex === 0),
                new ButtonBuilder()
                    .setCustomId("next_roles")
                    .setLabel("Next ➡")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(pageIndex === pages.length - 1)
            );
        };

        const msg = await message.channel.send({
            embeds: [getEmbed(page)],
            components: [getButtons(page)]
        });

        const collector = msg.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 60_000
        });

        collector.on("collect", async interaction => {
            if (interaction.customId === "next_roles" && page < pages.length - 1) page++;
            if (interaction.customId === "prev_roles" && page > 0) page--;

            await interaction.update({
                embeds: [getEmbed(page)],
                components: [getButtons(page)]
            });
        });

        collector.on("end", () => {
            msg.edit({ components: [] }).catch(() => {});
        });
    }
};