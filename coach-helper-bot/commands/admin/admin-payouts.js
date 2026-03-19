import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { payoutCoach, getEarnings } from "../../utils/earnings.js";

export default {
  data: new SlashCommandBuilder()
    .setName("admin-payouts")
    .setDescription("Pay out a coach (admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option =>
      option
        .setName("coach")
        .setDescription("Coach to pay")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("amount")
        .setDescription("Amount to pay")
        .setRequired(true)
    ),

  async execute(interaction) {
    const coach = interaction.options.getUser("coach");
    const amount = interaction.options.getInteger("amount");

    const earnings = getEarnings(coach.id);

    if (earnings.pendingPayout < amount) {
      return interaction.reply({
        content: `Coach only has $${earnings.pendingPayout} pending.`,
        ephemeral: true,
      });
    }

    payoutCoach(coach.id, amount);

    await interaction.reply({
      content: `Paid **$${amount}** to **${coach.username}**.`,
      ephemeral: true,
    });
  },
};
