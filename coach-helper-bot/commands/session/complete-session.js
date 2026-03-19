import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import { addEarnings } from "../../utils/earnings.js";

const bookingsPath = "data/bookings.json";

function ensureFiles() {
  if (!fs.existsSync("data")) fs.mkdirSync("data", { recursive: true });
  if (!fs.existsSync(bookingsPath)) fs.writeFileSync(bookingsPath, JSON.stringify([]));
}

export default {
  data: new SlashCommandBuilder()
    .setName("complete-session")
    .setDescription("Mark a session as completed.")
    .addStringOption(option =>
      option.setName("booking_id")
        .setDescription("The booking ID to complete.")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("amount")
        .setDescription("Earnings amount for this session.") 
        .setRequired(true)
        .setMinValue(0)
    ),

  async execute(interaction) {
    ensureFiles();

    const coach = interaction.user;
    const bookingId = interaction.options.getString("booking_id");
    const amount = interaction.options.getInteger("amount");

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

    if (booking.status !== "accepted") {
      return interaction.reply({
        content: `❌ Only **accepted** sessions can be completed. Current status: **${booking.status}**.`,
        ephemeral: true
      });
    }

    const now = new Date();
    const sessionTime = new Date(booking.sessionTime);

    if (sessionTime > now) {
      return interaction.reply({
        content: "❌ You cannot complete a session that hasn't happened yet.",
        ephemeral: true
      });
    }

    booking.status = "completed";
    bookings = bookings.map(b => (b.id === booking.id ? booking : b));
    fs.writeFileSync(bookingsPath, JSON.stringify(bookings, null, 2));

    // Add earnings
    addEarnings(coach.id, amount);

    return interaction.reply({
      content: `✅ Session **${bookingId}** marked as completed. Earnings added: **$${amount}**.`,
      ephemeral: true
    });
  }
};
