import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import fs from "fs";
import { loadEarnings } from "../../utils/earnings.js";
import { getAdminLogs } from "../../utils/admin.js";

const bookingsPath = "data/bookings.json";
const coachesPath = "data/coaches.json";

function ensureFiles() {
  if (!fs.existsSync("data")) fs.mkdirSync("data", { recursive: true });
  if (!fs.existsSync(bookingsPath)) fs.writeFileSync(bookingsPath, JSON.stringify([]));
  if (!fs.existsSync(coachesPath)) fs.writeFileSync(coachesPath, JSON.stringify({}));
}

export default {
  data: new SlashCommandBuilder()
    .setName("admin-dashboard")
    .setDescription("View platform-wide stats (admin only)."),

  async execute(interaction) {
    if (!interaction.memberPermissions.has("Administrator")) {
      return interaction.reply({
        content: "❌ You do not have permission to use this command.",
        ephemeral: true
      });
    }

    ensureFiles();

    const bookings = JSON.parse(fs.readFileSync(bookingsPath, "utf8"));
    const coaches = JSON.parse(fs.readFileSync(coachesPath, "utf8"));
    const earnings = loadEarnings();
    const logs = getAdminLogs();

    const totalCoaches = Object.keys(coaches).length;
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === "pending").length;
    const completedBookings = bookings.filter(b => b.status === "completed").length;

    const totalEarned = Object.values(earnings).reduce(
      (sum, e) => sum + (e.totalEarned || 0),
      0
    );
    const totalPendingPayout = Object.values(earnings).reduce(
      (sum, e) => sum + (e.pendingPayout || 0),
      0
    );

    const recentLogs = logs.slice(-5).reverse();
    const logsText = recentLogs.length
      ? recentLogs.map(l =>
          `• [${l.type}] ${l.reason || ""} ${l.amount ? `($${l.amount})` : ""} — ${l.timestamp}`
        ).join("\n")
      : "No recent admin actions.";

    const embed = new EmbedBuilder()
      .setTitle("🛡️ Admin Dashboard")
      .setColor("Purple")
      .addFields(
        {
          name: "Coaches",
          value: `**Total Coaches:** ${totalCoaches}`,
          inline: true
        },
        {
          name: "Bookings",
          value: `**Total:** ${totalBookings}\n**Pending:** ${pendingBookings}\n**Completed:** ${completedBookings}`,
          inline: true
        },
        {
          name: "Earnings",
          value: `**Total Earned:** $${totalEarned}\n**Pending Payout:** $${totalPendingPayout}`
        },
        {
          name: "Recent Admin Actions",
          value: logsText
        }
      );

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
