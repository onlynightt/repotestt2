module.exports = {
    name: "obc",
    description: "Broadcast to online members only",
    category: "broadcast",
    ownerOnly: true,
    async execute(client, message) {
     //   await message.delete().catch(() => {});

        const text = message.content.slice(client.config.prefix.length + 3).trim();

        if (!text) return message.channel.send("❌ Please provide a message.");

        const members = await message.guild.members.fetch({ force: true });
        const targets = members.filter(m =>
            !m.user.bot && m.presence && m.presence.status !== "offline"
        );

        message.channel.send(`📢 Sending message to ${targets.size} members...`);

        let sent = 0, failed = 0;
        const jobs = [...targets.values()].map(member => {
            const content = `${text}\n\n<@${member.id}>`;
            return client.limiter.schedule(() =>
                member.send(content).then(() => sent++).catch(() => failed++)
            );
        });

        await Promise.allSettled(jobs);
        message.channel.send(`✅ Message sent to ${sent} members.\n❌ Failed to message ${failed} members.`);
    }
};