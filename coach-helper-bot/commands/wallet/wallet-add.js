import {
  SlashCommandBuilder,
  EmbedBuilder
} from "discord.js";

import {
  loadWallets,
  saveWallets
} from "../../utils/wallet.js";

export default {
  data: new SlashCommandBuilder()
    .setName("wallet-add")
    .setDescription("Add funds to a user's wallet (admin only).")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("The user to add funds to")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("amount")
        .setDescription("Amount to add")
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction) {
    // Permission check
    if (!interaction.memberPermissions.has("Administrator")) {
      return interaction.reply({
        content: "❌ Only administrators can add wallet funds.",
        ephemeral: true
      });
    }

    const targetUser = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    // Load wallets
    const wallets = loadWallets();

    // Ensure wallet exists
    if (!wallets[targetUser.id]) {
      wallets[targetUser.id] = {
        balance: 0,
        history: []
      };
    }

    // Update balance
    wallets[targetUser.id].balance += amount;

    // Add history entry
    wallets[targetUser.id].history.push({
      type: "admin_add",
      amount,
      date: new Date().toISOString(),
      admin: interaction.user.id
    });

    // Save
    saveWallets(wallets);

    // Build embed
    const embed = new EmbedBuilder()
      .setTitle("💰 Wallet Updated")
      .setColor("Green")
      .setDescription(`Successfully added **$${amount}** to **${targetUser.username}**'s wallet.`)
      .addFields(
        { name: "New Balance", value: `$${wallets[targetUser.id].balance}` },
        { name: "Updated By", value: interaction.user.username }
      );

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};
