const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coach-earnings")
    .setDescription("View your earnings"),

  async execute(interaction) {
    try {
      const earnings = JSON.parse(fs.readFileSync("data/earnings.json", "utf8"));
      const amount = earnings[interaction.user.id] || 0;

      const embed = new EmbedBuilder()
        .setTitle("💰 Your Earnings")
        .setDescription(`You currently have **${amount} credits**.`)
        .setColor("Gold");

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error loading earnings.");
    }
  }
};
 
