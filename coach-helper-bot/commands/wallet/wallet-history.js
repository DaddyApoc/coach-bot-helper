const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getWallet } = require("../../utils/wallet");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("wallet-history")
    .setDescription("View your wallet transaction history"),

  async execute(interaction) {
    try {
      const wallet = getWallet(interaction.user.id); 

      if (!wallet.history || wallet.history.length === 0) {
        return interaction.reply("📭 Your wallet has no transaction history.");
      }

      const embed = new EmbedBuilder()
        .setTitle(`📜 Wallet History — ${interaction.user.username}`)
        .setColor("Blue");

      wallet.history.slice(-10).reverse().forEach(entry => {
        embed.addFields({
          name: `${entry.type === "add" ? "➕ Added" : "➖ Deducted"} ${entry.amount} credits`,
          value: `**Source/Reason:** ${entry.source || entry.reason}\n**Date:** ${entry.date}`
        });
      });

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error loading wallet history.");
    }
  }
};
