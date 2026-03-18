import {
  SlashCommandBuilder,
  EmbedBuilder
} from "discord.js";
import fs from "fs";

const bookingsPath = "/data/bookings.json";

export default {
  data: new SlashCommandBuilder()
    .setName("coach-accept")
    .setDescription("Accept a coaching session request.")
    .addStringOption(option =>
      option.setName("bookingid")
        .setDescription("The booking ID to accept")
        .setRequired(true)
    ),

  async execute(interaction) {
    const bookingId = interaction.options.getString("bookingid");
    const coachId = interaction.user.id;

    let bookings = JSON.parse(fs.readFileSync(bookingsPath, "utf8"));

    const booking = bookings.find(b => b.id === bookingId);

    if (!booking) {
      return interaction.reply({ content: "❌ Booking not found.", ephemeral: true });
    }

    if (booking.coachId !== coachId) {
      return interaction.reply({ content: "❌ This booking is not for you.", ephemeral: true });
    }

    if (booking.status !== "pending") {
      return interaction.reply({ content: "❌ This booking is already processed.", ephemeral: true });
    }

    booking.status = "accepted";
    fs.writeFileSync(bookingsPath, JSON.stringify(bookings, null, 2));

    // Notify student
    try {
      const student = await interaction.client.users.fetch(booking.studentId);
      await student.send(`✅ Your session with **${booking.coachName}** has been accepted!`);
    } catch {}

    return interaction.reply({
      content: `✅ Booking **${bookingId}** accepted.`,
      ephemeral: true
    });
  }
};
