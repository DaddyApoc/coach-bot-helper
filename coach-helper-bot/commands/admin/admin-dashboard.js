import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} from "discord.js";
import fs from "fs";
import path from "path";
import { getEarnings } from "../../utils/earnings.js";
import { loadSessions } from "../../utils/sessions.js";

export default {
  data: new SlashCommandBuilder()
    .setName("admin-dashboard")
    .setDescription("View the admin monetization dashboard")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const adminPath = path.join(process.cwd(), "data", "admin.json");
    const admin = JSON.parse(fs.readFileSync(adminPath, "utf8"));

    const sessions = Object.values(loadSessions());

    // Build earnings summary manually
    const earningsData = {};
    sessions.forEach(s => {
      if (!earningsData[s.coachId]) {
        earningsData[s.coachId] = { total: 0, pending: 0 };
      }
    });

    // Use getEarnings() for each coach
    for (const coachId of Object.keys(earningsData)) {
      const e = getEarnings(coachId);
      earningsData[coachId].total = e.totalEarned;
      earningsData[coachId].pending = e.pendingPayout;
    }

    const totalRevenue = Object.values(earningsData).reduce(
      (sum, e) => sum + e.total,
      0
    );

    const totalPending = Object.values(earningsData).reduce(
      (sum, e) => sum + e.pending,
      0
    );

    const embed = new EmbedBuilder()
      .setTitle("Admin Monetization Dashboard")
      .setColor("Purple")
      .addFields(
        {
          name: "Total Platform Revenue",
          value: `$${totalRevenue}`,
          inline: true
        },
        {
          name: "Pending Payouts",
          value: `$${totalPending}`,
          inline: true
        },
        {
          name: "Total Sessions",
          value: `${sessions.length}`,
          inline: true
        },
        {
          name: "Refunds Logged",
          value: `${admin.refunds.length}`,
          inline: true
        },
        {
          name: "Adjustments Logged",
          value: `${admin.adjustments.length}`,
          inline: true
        }
      )
      .setTimestamp();

    await interaction.reply({
      content: "",
      embeds: [embed],
      ephemeral: true
    });
  }
};
