const { SlashCommandBuilder } = require("discord.js");
const { getWallet, addToWallet, deductFromWallet } = require("../../utils/wallet");

module.exports = { 
  data: new SlashCommandBuilder()
    .setName("wallet-transfer")
    .setDescription("Transfer credits to another user")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("User to send credits to")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("amount")
        .setDescription("Amount to transfer")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const senderId = interaction.user.id;
      const receiver = interaction.options.getUser("user");
      const amount = interaction.options.getInteger("amount");

      if (receiver.id === senderId) {
        return interaction.reply("❌ You cannot transfer credits to yourself.");
      }

      if (amount <= 0) {
        return interaction.reply("❌ Transfer amount must be greater than zero.");
      }

      const senderWallet = getWallet(senderId);

      if (senderWallet.balance < amount) {
        return interaction.reply("❌ You do not have enough credits to complete this transfer.");
      }

      // Perform transfer
      deductFromWallet(senderId, amount, `Transfer to ${receiver.username}`);
      addToWallet(receiver.id, amount, `Transfer from ${interaction.user.username}`);

      await interaction.reply(
        `💸 Successfully transferred **${amount} credits** to **${receiver.username}**.`
      );

    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error processing transfer.");
    }
  }
};
