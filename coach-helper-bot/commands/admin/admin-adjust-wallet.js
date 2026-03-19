import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { getWallet, addToWallet, deductFromWallet } from "../../utils/wallet.js";
import { logAdjustment } from "../../utils/admin.js";

export default {
  data: new SlashCommandBuilder()
    .setName("admin-adjust-wallet")
    .setDescription("Adjust a user's wallet balance (admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option =>
      option.setName("user").setDescription("User to adjust").setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("amount").setDescription("Amount to adjust (+/-)").setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason").setDescription("Reason for adjustment").setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");
    const reason = interaction.options.getString("reason");

    if (amount > 0) {
      addToWallet(user.id, amount);
    } else {
      const success = deductFromWallet(user.id, Math.abs(amount));
      if (!success) {
        return interaction.reply({
          content: "User does not have enough balance.",
          ephemeral: true,
        });
      }
    }

    logAdjustment(user.id, amount, reason);

    await interaction.reply({
      content: `Adjusted **$${amount}** for **${user.username}**.\nReason: ${reason}`,
      ephemeral: true,
    });
  },
};
