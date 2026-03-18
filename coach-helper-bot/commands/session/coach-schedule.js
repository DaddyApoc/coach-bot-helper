import {
  SlashCommandBuilder,
  EmbedBuilder
} from "discord.js";
import fs from "fs";

const bookingsPath = "/data/bookings.json";

export default {
  data: new SlashCommandBuilder()
    .setName("coach-schedule")
    .setDescription("View all your coaching bookings."),

  async execute(interaction) {
    const coachId = interaction.user.id;

    let bookings = JSON.parse(fs.readFileSync(bookingsPath, "utf8"));

    const mine = bookings.filter(b => b.coachId === coachId);

    if (mine.length === 0) {
      return interaction.reply({
        content: "📭 You have no bookings.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("📅 Your Coaching Schedule")
      .setColor("Purple");

    mine.forEach(b => {
      embed.addFields({
        name: `${b.time} — ${b.studentName}`,
        value: `Status: **${b.status}**\nNotes: ${b.notes}`
      });
    });

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
