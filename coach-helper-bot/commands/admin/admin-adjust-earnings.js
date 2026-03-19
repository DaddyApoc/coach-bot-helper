import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { getEarnings, addEarnings, deductEarnings } from "../../utils/earnings.js";
import { logAdjustment } from "../../utils/admin.js";

export default {
  data: new SlashCommandBuilder()
    .setName("admin-adjust-earnings")
    .setDescription("Adjust a coach's earnings (admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option =>
      option.setName("coach").setDescription("Coach to adjust").setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("amount").setDescription("Amount (+/-)").setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason").setDescription("Reason for adjustment").setRequired(true)
    ),

  async execute(interaction) {
    const coach = interaction.options.getUser("coach");
    const amount = interaction.options.getInteger("amount");
    const reason = interaction.options.getString("reason");

    if (amount > 0) {
      addEarnings(coach.id, amount, "admin_adjustment");
    } else {
      const success = deductEarnings(coach.id, Math.abs(amount));
      if (!success) {
        return interaction.reply({
          content: "Coach does not have enough pending payout.",
          ephemeral: true,
        });
      }
    }

    logAdjustment(coach.id, amount, reason);

    await interaction.reply({
      content: `Adjusted earnings by **$${amount}** for **${coach.username}**.\nReason: ${reason}`,
      ephemeral: true,
    });
  },
};
