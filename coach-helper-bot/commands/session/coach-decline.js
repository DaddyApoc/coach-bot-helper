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
    .setName("coach-decline")
    .setDescription("Decline a coaching session request.")
    .addStringOption(option =>
      option.setName("booking-id")
        .setDescription("The booking ID to decline")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason")
        .setDescription("Reason for declining (optional)")
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      ensureFile();
      const bookingId = interaction.options.getString("booking-id");
      const reason = interaction.options.getString("reason") || "No reason provided";

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
          content: "❌ You can only decline your own bookings.",
          ephemeral: true
        });
      }

      booking.status = "declined";
      booking.declineReason = reason;
      fs.writeFileSync(bookingsPath, JSON.stringify(bookings, null, 2));

      const embed = new EmbedBuilder()
        .setTitle("❌ Session Declined")
        .setColor("Red")
        .addFields(
          { name: "Student", value: booking.studentName },
          { name: "Reason", value: reason }
        );

      await interaction.reply({ embeds: [embed] });

      try {
        const student = await interaction.client.users.fetch(booking.studentId);
        const dmEmbed = new EmbedBuilder()
          .setTitle("❌ Session Declined")
          .setColor("Red")
          .setDescription(`**${booking.coachName}** has declined your session request.`)
          .addFields({ name: "Reason", value: reason });

        await student.send({ embeds: [dmEmbed] });
      } catch (err) {
        console.log("DM failed:", err);
      }
    } catch (error) {
      console.error(error);
      await interaction.reply("❌ Error declining session.");
    }
  }
};
