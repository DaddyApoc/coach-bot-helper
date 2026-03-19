import { SlashCommandBuilder } from "discord.js";
import { getEarnings } from "../../utils/earnings.js";

export default {
  data: new SlashCommandBuilder()
    .setName("coach-earnings")
    .setDescription("View your coaching earnings"),

  async execute(interaction) {
    const coachId = interaction.user.id;
    const earnings = getEarnings(coachId);

    const msg = [
      `**Total Earned:** $${earnings.totalEarned}`,
      `**Pending Payout:** $${earnings.pendingPayout}`,
      ``,
      `**Recent Activity:**`,
      earnings.history
        .slice(-10)
        .reverse()
        .map(h => {
          const date = new Date(h.date).toLocaleString();
          return `• ${h.type} — $${h.amount} (${date})`;
        })
        .join("\n") || "No earnings yet.",
    ].join("\n");

    await interaction.reply({
      content: msg,
      ephemeral: true,
    });
  },
};
