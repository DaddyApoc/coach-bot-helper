const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { addToWallet } = require("../../utils/wallet");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("wallet-add")
    .setDescription("Add funds to a user's wallet (Admin only)")
    .addUserOption(option => 
      option.setName("user")
        .setDescription("User to add funds to")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("amount")
        .setDescription("Amount to add")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      const user = interaction.options.getUser("user");
      const amount = interaction.options.getInteger("amount");

      const wallet = addToWallet(user.id, amount, "admin");

      await interaction.reply(
        `💰 Added **${amount} credits** to **${user.username}**.\n` +
        `New Balance: **${wallet.balance} credits**`
      );
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error adding funds.");
    }
  }
};
