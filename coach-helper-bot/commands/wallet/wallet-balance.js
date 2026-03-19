const { SlashCommandBuilder } = require("discord.js");
const { getWallet } = require("../../utils/wallet");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("wallet-balance")
    .setDescription("Check your wallet balance"),

  async execute(interaction) {
    try {
      const wallet = getWallet(interaction.user.id);

      await interaction.reply(
        `💳 **Your Wallet Balance:** ${wallet.balance} credits`
      );
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error retrieving wallet balance.");
    }
  }
};
