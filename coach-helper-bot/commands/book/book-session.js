const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const filePath = "data/sessions.json";

function ensureFile() {
  if (!fs.existsSync("data")) fs.mkdirSync("data", { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify([]));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("book-session")
    .setDescription("Book a coaching session with a coach")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("Coach to book")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("date")
        .setDescription("Date (YYYY-MM-DD)")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("time")
        .setDescription("Time (e.g. 3:00 PM)")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("timezone")
        .setDescription("Your timezone (e.g. EST, PST)")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("notes")
        .setDescription("Optional notes for the coach")
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      ensureFile();

      const coach = interaction.options.getUser("coach");
      const date = interaction.options.getString("date");
      const time = interaction.options.getString("time");
      const timezone = interaction.options.getString("timezone");
      const notes = interaction.options.getString("notes") || "None";

      const sessions = JSON.parse(fs.readFileSync(filePath, "utf8"));

      // Prevent double booking
      const conflict = sessions.find(
        s => s.coachId === coach.id && s.date === date && s.time === time
      );

      if (conflict) {
        return interaction.reply(`❌ **${coach.username}** is already booked at that time.`);
      }

      const session = {
        id: Date.now(),
        studentId: interaction.user.id,
        coachId: coach.id,
        date,
        time,
        timezone,
        notes,
        status: "pending",
        createdAt: new Date().toISOString()
      };

      sessions.push(session);
      fs.writeFileSync(filePath, JSON.stringify(sessions, null, 2));

      const embed = new EmbedBuilder()
        .setTitle("📘 Session Requested")
        .setDescription(`Your session request has been sent to **${coach.username}**`)
        .addFields(
          { name: "Date", value: date, inline: true },
          { name: "Time", value: time, inline: true },
          { name: "Timezone", value: timezone, inline: true },
          { name: "Notes", value: notes }
        )
        .setColor("Blue");

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error booking session.");
    }
  }
};
