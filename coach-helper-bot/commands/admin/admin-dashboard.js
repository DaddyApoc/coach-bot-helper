import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import fs from "fs";

const coachesPath = "data/coaches.json";
const deniedPath = "data/deniedCoaches.json";
const bookingsPath = "data/bookings.json";
const progressPath = "data/studentProgress.json";
const feedbackPath = "data/feedback.json";

export default {
  data: new SlashCommandBuilder()
    .setName("admin-dashboard")
    .setDescription("View platform analytics and health overview.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    // Load files safely
    const coaches = fs.existsSync(coachesPath) ? JSON.parse(fs.readFileSync(coachesPath)) : [];
    const denied = fs.existsSync(deniedPath) ? JSON.parse(fs.readFileSync(deniedPath)) : [];
    const bookings = fs.existsSync(bookingsPath) ? JSON.parse(fs.readFileSync(bookingsPath)) : [];
    const progress = fs.existsSync(progressPath) ? JSON.parse(fs.readFileSync(progressPath)) : [];
    const feedback = fs.existsSync(feedbackPath) ? JSON.parse(fs.readFileSync(feedbackPath)) : [];

    // Coach stats
    const totalCoaches = coaches.length;
    const verifiedCoaches = coaches.filter(c => c.verified && !c.suspended).length;
    const suspendedCoaches = coaches.filter(c => c.suspended).length;
    const pendingCoaches = coaches.filter(c => !c.verified && !c.suspended).length;
    const deniedCoaches = denied.length;

    // Student stats
    const studentIds = [...new Set(progress.map(p => p.studentId))];
    const totalStudents = studentIds.length;

    // Most active student
    const studentSessionCounts = {};
    bookings.forEach(b => {
      if (!studentSessionCounts[b.studentId]) studentSessionCounts[b.studentId] = 0;
      studentSessionCounts[b.studentId]++;
    });
    const mostActiveStudentId = Object.entries(studentSessionCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    // Session stats
    const totalSessions = bookings.length;

    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const sessionsThisWeek = bookings.filter(b => new Date(b.time).getTime() >= oneWeekAgo).length;

    // Most active coach
    const coachSessionCounts = {};
    bookings.forEach(b => {
      if (!coachSessionCounts[b.coachId]) coachSessionCounts[b.coachId] = 0;
      coachSessionCounts[b.coachId]++;
    });
    const mostActiveCoachId = Object.entries(coachSessionCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    // Rating stats
    const totalReviews = feedback.length;
    const avgRating = totalReviews > 0
      ? (feedback.reduce((sum, f) => sum + f.rating, 0) / totalReviews).toFixed(2)
      : "N/A";

    const embed = new EmbedBuilder()
      .setTitle("📊 Platform Admin Dashboard")
      .setColor("Purple")
      .setTimestamp()
      .addFields(
        {
          name: "👥 Coaches",
          value:
            `**Total:** ${totalCoaches}\n` +
            `**Verified:** ${verifiedCoaches}\n` +
            `**Pending:** ${pendingCoaches}\n` +
            `**Suspended:** ${suspendedCoaches}\n` +
            `**Denied:** ${deniedCoaches}`,
          inline: true
        },
        {
          name: "🎓 Students",
          value:
            `**Total Students:** ${totalStudents}\n` +
            `**Most Active:** ${mostActiveStudentId ? `<@${mostActiveStudentId}>` : "None"}`,
          inline: true
        },
        {
          name: "📘 Sessions",
          value:
            `**Total Sessions:** ${totalSessions}\n` +
            `**This Week:** ${sessionsThisWeek}\n` +
            `**Most Active Coach:** ${mostActiveCoachId ? `<@${mostActiveCoachId}>` : "None"}`,
          inline: false
        },
        {
          name: "⭐ Ratings",
          value:
            `**Total Reviews:** ${totalReviews}\n` +
            `**Average Rating:** ${avgRating}`,
          inline: false
        }
      );

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
