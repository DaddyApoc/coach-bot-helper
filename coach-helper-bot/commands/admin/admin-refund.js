import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { addToWallet } from "../../utils/wallet.js";
import { logRefund } from "../../utils/admin.js";
import { flagUser } from "../../utils/admin.js";

export default {
  data: new SlashCommandBuilder()
    .setName("admin-refund")
    .setDescription("Refund a user (admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option =>
      option.setName("user").setDescription("User to refund").setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("amount").setDescription("Refund amount").setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason").setDescription("Reason for refund").setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");
    const reason = interaction.options.getString("reason");

    addToWallet(user.id, amount);
    logRefund(user.id, amount, reason);
    flagUser(user.id, `Refund issued: $${amount}`, 10);

    await interaction.reply({
      content: `Refunded **$${amount}** to **${user.username}**.\nReason: ${reason}`,
      ephemeral: true,
    });
  },
};

import { flagUser } from "../../utils/admin.js";

logRefund(user.id, amount, reason);
flagUser(user.id, `Refund issued: $${amount}`, 10);
