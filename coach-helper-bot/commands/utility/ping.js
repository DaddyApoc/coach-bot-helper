const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check if the bot is online"),

  async execute(interaction) {
    try {
      const sent = await interaction.reply({ content: "🏓 Pinging...", fetchReply: true });
      const latency = sent.createdTimestamp - interaction.createdTimestamp;

      await interaction.editReply(`🏓 Pong! Bot Latency: **${latency}ms**`);
    } catch (err) { 
      console.error(err);
      await interaction.reply("❌ Error processing ping.");
    }
  }
};
