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
    .setName("my-sessions")
    .setDescription("View your booked coaching sessions."),
 
  async execute(interaction) {
    try {
      ensureFile();
      const studentId = interaction.user.id;

      let bookings = JSON.parse(fs.readFileSync(bookingsPath, "utf8"));
      const studentBookings = bookings.filter(b =>
        b.studentId === studentId && (b.status === "pending" || b.status === "accepted")
      );

      if (studentBookings.length === 0) {
        return interaction.reply({
          content: "📅 You have no booked sessions.",
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setTitle("📅 Your Booked Sessions")
        .setColor("Blue")
        .setDescription(
          studentBookings
            .map(b => `**${b.coachName}** — ${b.displayTime} (${b.timezone}) [${b.status}]`)
            .join("\n")
        );

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply("❌ Error retrieving sessions.");
    } 
  }
};
