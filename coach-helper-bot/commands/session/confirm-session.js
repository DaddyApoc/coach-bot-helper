import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import fs from "fs";

const bookingsPath = "data/bookings.json";

function ensureFiles() {
  if (!fs.existsSync("data")) fs.mkdirSync("data", { recursive: true });
  if (!fs.existsSync(bookingsPath)) fs.writeFileSync(bookingsPath, JSON.stringify([]));
}

export default {
  data: new SlashCommandBuilder()
    .setName("confirm-session")
    .setDescription("Accept or decline a session request.")
    .addStringOption(option =>
      option.setName("booking_id")
        .setDescription("The booking ID from the request.")
        .setRequired(true)
    ) 
    .addStringOption(option =>
      option.setName("action")
        .setDescription("Accept or decline the session.")
        .setRequired(true)
        .addChoices(
          { name: "Accept", value: "accept" },
          { name: "Decline", value: "decline" }
        )
    ),

  async execute(interaction) {
    ensureFiles();

    const coach = interaction.user;
    const bookingId = interaction.options.getString("booking_id");
    const action = interaction.options.getString("action");

    let bookings = JSON.parse(fs.readFileSync(bookingsPath, "utf8"));
    const booking = bookings.find(b => b.id === bookingId);

    if (!booking) {
      return interaction.reply({
        content: "❌ Booking not found.",
        ephemeral: true
      });
    }

    if (booking.coachId !== coach.id) {
      return interaction.reply({
        content: "❌ You are not the coach for this booking.",
        ephemeral: true
      });
    }

    if (booking.status !== "pending") {
      return interaction.reply({
        content: `❌ This booking is already **${booking.status}**.`,
        ephemeral: true
      });
    }

    if (action === "accept") {
      booking.status = "accepted";
    } else {
      booking.status = "declined";
    }

    bookings = bookings.map(b => (b.id === booking.id ? booking : b));
    fs.writeFileSync(bookingsPath, JSON.stringify(bookings, null, 2));

    // Notify student if possible
    try {
      const student = await interaction.client.users.fetch(booking.studentId);
      const dmEmbed = new EmbedBuilder()
        .setTitle(action === "accept" ? "✅ Session Accepted" : "❌ Session Declined")
        .setColor(action === "accept" ? "Green" : "Red")
        .setDescription(
          action === "accept"
            ? `Your session with **${booking.coachName}** has been accepted.`
            : `Your session with **${booking.coachName}** has been declined.`
        )
        .addFields(
          { name: "Session Time", value: `${booking.displayTime} (${booking.timezone})` },
          { name: "Booking ID", value: booking.id }
        );

      await student.send({ embeds: [dmEmbed] });
    } catch (err) {
      console.log("DM to student failed:", err);
    }

    return interaction.reply({
      content: `Session **${bookingId}** has been **${booking.status}**.`,
      ephemeral: true
    });
  }
};
