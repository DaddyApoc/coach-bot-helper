import {
  SlashCommandBuilder
} from "discord.js";
import fs from "fs";

const bookingsPath = "/data/bookings.json";
const progressPath = "/data/studentProgress.json";

export default {
  data: new SlashCommandBuilder()
    .setName("session-complete")
    .setDescription("Mark a session as completed and trigger progress tracking + feedback survey.")
    .addStringOption(option =>
      option.setName("bookingid")
        .setDescription("The booking ID to complete")
        .setRequired(true)
    ),

  async execute(interaction) {
    const bookingId = interaction.options.getString("bookingid");
    const coachId = interaction.user.id;

    if (!fs.existsSync(bookingsPath)) {
      return interaction.reply({ content: "❌ No bookings found.", ephemeral: true });
    }

    let bookings = JSON.parse(fs.readFileSync(bookingsPath, "utf8"));
    let progress = JSON.parse(fs.readFileSync(progressPath, "utf8"));

    const booking = bookings.find(b => b.id === bookingId);

    if (!booking) {
      return interaction.reply({ content: "❌ Booking not found.", ephemeral: true });
    }

    if (booking.coachId !== coachId) {
      return interaction.reply({ content: "❌ This booking is not for you.", ephemeral: true });
    }

    if (booking.status !== "accepted") {
      return interaction.reply({ content: "❌ This session is not accepted yet.", ephemeral: true });
    }

    booking.status = "completed";

    // Create progress entry
    const entry = {
      id: Date.now().toString(),
      studentId: booking.studentId,
      studentName: booking.studentName,
      coachId: booking.coachId,
      coachName: booking.coachName,
      time: booking.time,
      weapon: booking.weapon || "Unknown",
      notes: booking.notes || "None",
      improvementScore: null,
      beforeStats: null,
      afterStats: null,
      skillTags: [],
      coachComments: null,
      studentSelfRating: null,
      created: new Date().toISOString()
    };

    progress.push(entry);

    fs.writeFileSync(bookingsPath, JSON.stringify(bookings, null, 2));
    fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));

    // Send feedback survey to student
    try {
      const student = await interaction.client.users.fetch(booking.studentId);
      await student.send(
        `⭐ Your session with **${booking.coachName}** is complete!\n` +
        `Please rate your coach using:\n` +
        "`/rate-coach coach:@user rating:1-5 comment:\"...\" tags:\"aim, movement, communication\"`"
      );
    } catch {}

    return interaction.reply({
      content: `✅ Session completed. Progress entry created & survey sent.`,
      ephemeral: true
    });
  }
};
