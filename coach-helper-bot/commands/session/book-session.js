import {
  SlashCommandBuilder,
  EmbedBuilder
} from "discord.js";
import fs from "fs";

const bookingsPath = "/data/bookings.json";
const coachesPath = "/data/coaches.json";

function ensureFiles() {
  if (!fs.existsSync(coachesPath)) {
    fs.writeFileSync(coachesPath, JSON.stringify({}));
  }
  if (!fs.existsSync(bookingsPath)) {
    fs.writeFileSync(bookingsPath, JSON.stringify([]));
  }
}

export default {
  data: new SlashCommandBuilder()
    .setName("book-session")
    .setDescription("Book a coaching session with a coach.")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("The coach you want to book")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("day")
        .setDescription("Day (1-31)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(31)
    )
    .addIntegerOption(option =>
      option.setName("month")
        .setDescription("Month (1-12)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(12)
    )
    .addIntegerOption(option =>
      option.setName("year")
        .setDescription("Year (e.g. 2025)")
        .setRequired(true)
        .setMinValue(2025)
        .setMaxValue(2099)
    )
    .addIntegerOption(option =>
      option.setName("hour")
        .setDescription("Hour (0-23)")
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(23)
    )
    .addIntegerOption(option =>
      option.setName("minute")
        .setDescription("Minute (0-59)")
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(59)
    )
    .addStringOption(option =>
      option.setName("notes")
        .setDescription("Anything the coach should know?")
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      ensureFiles();
      const coachUser = interaction.options.getUser("coach");
      const studentUser = interaction.user;
      const day = interaction.options.getInteger("day");
      const month = interaction.options.getInteger("month");
      const year = interaction.options.getInteger("year");
      const hour = interaction.options.getInteger("hour");
      const minute = interaction.options.getInteger("minute");
      const notes = interaction.options.getString("notes") || "None";

      // Create ISO string from components
      const dateString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00Z`;
      const sessionTime = new Date(dateString);

      // Validate date
      if (isNaN(sessionTime.getTime())) {
        return interaction.reply({
          content: "❌ Invalid date/time. Please check your inputs.",
          ephemeral: true
        });
      }

      // Check if date is in the past
      if (sessionTime < new Date()) {
        return interaction.reply({
          content: "❌ Session time must be in the future.",
          ephemeral: true
        });
      }

      const coaches = JSON.parse(fs.readFileSync(coachesPath, "utf8"));

      if (!coaches[coachUser.id]) {
        return interaction.reply({
          content: "❌ That coach is not registered.",
          ephemeral: true
        });
      }

      let bookings = JSON.parse(fs.readFileSync(bookingsPath, "utf8"));

      const conflict = bookings.find(b =>
        b.coachId === coachUser.id &&
        b.sessionTime === dateString &&
        (b.status === "pending" || b.status === "accepted")
      );

      if (conflict) {
        return interaction.reply({
          content: "❌ This coach already has a session booked at that time.",
          ephemeral: true
        });
      }

      const booking = {
        id: Date.now().toString(),
        coachId: coachUser.id,
        coachName: coachUser.username,
        studentId: studentUser.id,
        studentName: studentUser.username,
        sessionTime: dateString,
        notes,
        status: "pending",
        reminderSent: false,
        created: new Date().toISOString()
      };

      bookings.push(booking);
      fs.writeFileSync(bookingsPath, JSON.stringify(bookings, null, 2));

      try {
        const dmEmbed = new EmbedBuilder()
          .setTitle("📬 New Coaching Session Request")
          .setColor("Blue")
          .addFields(
            { name: "Student", value: studentUser.username },
            { name: "Session Time", value: `<t:${Math.floor(sessionTime.getTime() / 1000)}:F>` },
            { name: "Notes", value: notes },
            { name: "Booking ID", value: booking.id }
          );

        await coachUser.send({ embeds: [dmEmbed] });
      } catch (err) {
        console.log("DM failed:", err);
      }

      const embed = new EmbedBuilder()
        .setTitle("✅ Session Request Sent")
        .setColor("Green")
        .setDescription(`Your session request has been sent to **${coachUser.username}**.`)
        .addFields(
          { name: "Session Time", value: `<t:${Math.floor(sessionTime.getTime() / 1000)}:F>` },
          { name: "Notes", value: notes },
          { name: "Booking ID", value: booking.id }
        );

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply("❌ Error booking session.");
    }
  }
};
