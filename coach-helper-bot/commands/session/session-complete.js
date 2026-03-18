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
    .setName("session-complete")
    .setDescription("Mark a coaching session as complete.")
    .addStringOption(option =>
      option.setName("booking-id")
        .setDescription("The booking ID to mark complete")
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
          content: "❌ Only the coach can mark a session complete.",
          ephemeral: true
        });
      }

      booking.status = "completed";
      booking.completedAt = new Date().toISOString();
      fs.writeFileSync(bookingsPath, JSON.stringify(bookings, null, 2));

      const embed = new EmbedBuilder()
        .setTitle("✅ Session Completed")
        .setColor("Green")
        .addFields(
          { name: "Student", value: booking.studentName },
          { name: "Time", value: booking.time }
        );

      await interaction.reply({ embeds: [embed] });

      try {
        const student = await interaction.client.users.fetch(booking.studentId);
        const dmEmbed = new EmbedBuilder()
          .setTitle("✅ Session Completed")
          .setColor("Green")
          .setDescription(`Your session with **${booking.coachName}** has been marked complete!`)
          .addFields({ name: "Time", value: booking.time });

        await student.send({ embeds: [dmEmbed] });
      } catch (err) {
        console.log("DM failed:", err);
      }
    } catch (error) {
      console.error(error);
      await interaction.reply("❌ Error completing session.");
    }
  }
};
