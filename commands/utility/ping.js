  module.exports = {
   name: "ping",
     description: "Check bot latency",
      category: "public",
    usage: "",
    async execute(client, message, args) {
        const sent = await message.channel.send("🏓 Pinging...");
         sent.edit(`🏓 Pong! \nLatency: \`${sent.createdTimestamp - message.createdTimestamp}ms\``);
   }
 };