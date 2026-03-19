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
    .setName("coach-accept")
    .setDescription("Accept a coaching session request.")
    .addStringOption(option =>
      option.setName("booking-id")
        .setDescription("The booking ID to accept")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      ensureFile();
      const bookingId = interaction.options.getString("booking-id");

      let bookings = JSON.parse(fs.readFileSync(bookingsPath, "utf8"));
      const booking = bookings.find(b => b.id === bookingId);

      if (!booking) {
        return interaction.reply({
          content: "❌ Booking not found.",
          ephemeral: true
        });
      }

      if (booking.coachId !== interaction.user.id) {
        return interaction.reply({
          content: "❌ You can only accept your own bookings.",
          ephemeral: true
        });
      }

      booking.status = "accepted";
      fs.writeFileSync(bookingsPath, JSON.stringify(bookings, null, 2));

      const embed = new EmbedBuilder()
        .setTitle("✅ Session Accepted")
        .setColor("Green")
        .addFields(
          { name: "Student", value: booking.studentName },
          { name: "Time", value: booking.time }
        );

      await interaction.reply({ embeds: [embed] });

      try {
        const student = await interaction.client.users.fetch(booking.studentId);
        const dmEmbed = new EmbedBuilder()
          .setTitle("✅ Session Accepted")
          .setColor("Green")
          .setDescription(`**${booking.coachName}** has accepted your session request!`)
          .addFields({ name: "Time", value: booking.time });

        await student.send({ embeds: [dmEmbed] });
      } catch (err) {
        console.log("DM failed:", err);
      }
    } catch (error) {
      console.error(error);
      await interaction.reply("❌ Error accepting session.");
    }
  }
};
