import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import fs from "fs";
import { getEarnings } from "../../utils/earnings.js";

const bookingsPath = "data/bookings.json";

function ensureFiles() {
  if (!fs.existsSync("data")) fs.mkdirSync("data", { recursive: true });
  if (!fs.existsSync(bookingsPath)) fs.writeFileSync(bookingsPath, JSON.stringify([]));
}

export default {
  data: new SlashCommandBuilder()
    .setName("coach-dashboard")
    .setDescription("View your upcoming sessions and earnings."),

  async execute(interaction) {
    ensureFiles();

    const coach = interaction.user;
    const bookings = JSON.parse(fs.readFileSync(bookingsPath, "utf8"));
    const earnings = getEarnings(coach.id);

    const upcoming = bookings
      .filter(b => b.coachId === coach.id && (b.status === "pending" || b.status === "accepted"))
      .sort((a, b) => new Date(a.sessionTime) - new Date(b.sessionTime))
      .slice(0, 5);

    const completed = bookings
      .filter(b => b.coachId === coach.id && b.status === "completed")
      .sort((a, b) => new Date(b.sessionTime) - new Date(a.sessionTime))
      .slice(0, 5);

    const upcomingText = upcoming.length
      ? upcoming.map(b =>
          `• **${b.displayTime} (${b.timezone})** — ${b.studentName} — *${b.status}* (ID: \`${b.id}\`)`
        ).join("\n")
      : "No upcoming sessions.";

    const completedText = completed.length
      ? completed.map(b =>
          `• **${b.displayTime} (${b.timezone})** — ${b.studentName} (ID: \`${b.id}\`)`
        ).join("\n")
      : "No completed sessions yet.";

    const embed = new EmbedBuilder()
      .setTitle(`📊 Coach Dashboard — ${coach.username}`)
      .setColor("Blue")
      .addFields(
        {
          name: "Upcoming Sessions",
          value: upcomingText
        },
        {
          name: "Recent Completed Sessions",
          value: completedText
        },
        {
          name: "Earnings",
          value: `**Total Earned:** $${earnings.totalEarned}\n**Pending Payout:** $${earnings.pendingPayout}`
        }
      );

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
