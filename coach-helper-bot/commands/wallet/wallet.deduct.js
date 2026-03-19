const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { deductFromWallet } = require("../../utils/wallet");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("wallet-deduct")
    .setDescription("Deduct credits from a user's wallet (Admin only)")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("User to deduct from") 
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("amount")
        .setDescription("Amount to deduct")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      const user = interaction.options.getUser("user");
      const amount = interaction.options.getInteger("amount");

      if (amount <= 0) {
        return interaction.reply("❌ Deduction amount must be greater than zero.");
      }

      const wallet = deductFromWallet(user.id, amount, "admin");

      await interaction.reply(
        `➖ Deducted **${amount} credits** from **${user.username}**.\n` +
        `New Balance: **${wallet.balance} credits**`
      );

    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error deducting funds.");
    }
  }
};
