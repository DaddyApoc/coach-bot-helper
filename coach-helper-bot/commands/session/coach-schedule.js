import {
  SlashCommandBuilder,
  EmbedBuilder
} from "discord.js";
import fs from "fs";

const bookingsPath = "/data/bookings.json";

function ensureFile() {
  if (!fs.existsSync(bookingsPath)) {
    fs.writeFileSync(bookingsPath, JSON.stringify([]));
  }
}

export default {
  data: new SlashCommandBuilder()
    .setName("coach-schedule")
    .setDescription("View your upcoming coaching sessions."),

  async execute(interaction) {
    try {
      ensureFile();
      const coachId = interaction.user.id;

      let bookings = JSON.parse(fs.readFileSync(bookingsPath, "utf8"));
      const coachBookings = bookings.filter(b =>
        b.coachId === coachId && (b.status === "pending" || b.status === "accepted")
      );

      if (coachBookings.length === 0) {
        return interaction.reply({
          content: "📅 You have no upcoming sessions.",
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setTitle("📅 Your Coaching Schedule")
        .setColor("Blue")
        .setDescription(
          coachBookings
            .map(b => `**${b.studentName}** — ${b.displayTime} (${b.timezone}) [${b.status}]`)
            .join("\n")
        );

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply("❌ Error retrieving schedule.");
    }
  }
};
