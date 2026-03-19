const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin-transactions")
    .setDescription("View all wallet transactions"),

  async execute(interaction) {
    try {
      const history = JSON.parse(fs.readFileSync("data/transactions.json", "utf8"));

      const embed = new EmbedBuilder()
        .setTitle("💳 Transaction History")
        .setColor("Green");

      history.forEach((tx, i) => {
        embed.addFields({
          name: `Transaction ${i + 1}`,
          value: `**User:** <@${tx.userId}>\n**Amount:** ${tx.amount}\n**Type:** ${tx.type}\n**Date:** ${tx.date}`
        });
      });

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error loading transactions.");
    }
  }
};
