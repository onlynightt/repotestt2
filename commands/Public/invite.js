
module.exports = {
  name: "invite",
  aliases: ["inv"],
  description: "Get the bot's invite link",
  category: "public",
  async execute(client, message) {
    const clientId = client.user.id;
    const permissions = 8;
    const scopes = ["bot", "applications.commands"];

    const inviteLink = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=${scopes.join("%20")}`;

    message.reply({
      embeds: [
        {
          title: "🔗 Invite Me!",
          description: `[Click here to invite the bot](${inviteLink}) to your server.`,
          color: 0x5865F2
        }
      ]
    });
  }
};