
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "weather",
    aliases: ["w"],
    description: "Get weather information for a city",
    category: "public",
    async execute(client, message, args) {
        if (!args.length) {
            return message.reply("❌ Please provide a city name. Example: `weather London`");
        }

        const city = args.join(" ");
        
        // Mock weather data (you can integrate with a real weather API)
        const weatherData = {
            city: city,
            temperature: Math.floor(Math.random() * 35) + 5, // Random temp between 5-40°C
            condition: ["Sunny", "Cloudy", "Rainy", "Snowy", "Windy"][Math.floor(Math.random() * 5)],
            humidity: Math.floor(Math.random() * 50) + 30, // Random humidity 30-80%
            windSpeed: Math.floor(Math.random() * 20) + 5 // Random wind 5-25 km/h
        };

        const embed = new EmbedBuilder()
            .setTitle(`🌤️ Weather in ${weatherData.city}`)
            .setColor('#87CEEB')
            .addFields(
                { name: '🌡️ Temperature', value: `${weatherData.temperature}°C`, inline: true },
                { name: '☁️ Condition', value: weatherData.condition, inline: true },
                { name: '💧 Humidity', value: `${weatherData.humidity}%`, inline: true },
                { name: '💨 Wind Speed', value: `${weatherData.windSpeed} km/h`, inline: true }
            )
            .setFooter({ text: 'Weather data is simulated for demo purposes' })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
