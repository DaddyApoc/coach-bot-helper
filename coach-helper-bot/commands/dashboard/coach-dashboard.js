import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getEarnings } from "../../utils/earnings.js";
import { loadSessions } from "../../utils/sessions.js";

export default {
  data: new SlashCommandBuilder()
    .setName("coach-dashboard")
    .setDescription("View your coach dashboard"),

  async execute(interaction) {
    const coachId = interaction.user.id;
    const earnings = getEarnings(coachId);
    const sessions = Object.values(loadSessions()).filter(
      s => s.coachId === coachId
    );

    const active = sessions.filter(s => s.status !== "completed");
    const completed = sessions.filter(s => s.status === "completed");

    const embed = new EmbedBuilder()
      .setTitle(`${interaction.user.username}'s Coach Dashboard`)
      .setColor("Green")
      .addFields(
        {
          name: "Total Earned",
          value: `$${earnings.totalEarned}`,
          inline: true,
        },
        {
          name: "Pending Payout",
          value: `$${earnings.pendingPayout}`,
          inline: true,
        },
        {
          name: "Active Sessions",
          value: `${active.length}`,
          inline: true,
        },
        {
          name: "Completed Sessions",
          value: `${completed.length}`,
          inline: true,
        }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
