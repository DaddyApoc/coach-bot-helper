const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("book-session")
    .setDescription("Book a coaching session")
    .addUserOption(opt =>
      opt.setName("coach")
        .setDescription("Coach to book")
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("time")
        .setDescription("Requested time")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const coach = interaction.options.getUser("coach");
      const time = interaction.options.getString("time");

      const sessions = JSON.parse(fs.readFileSync("data/sessions.json", "utf8"));

      const newSession = {
        id: Date.now().toString(),
        student: interaction.user.id,
        coach: coach.id,
        time,
        status: "pending"
      };

      sessions.push(newSession);
      fs.writeFileSync("data/sessions.json", JSON.stringify(sessions, null, 2));

      return interaction.reply(`📅 Session requested with **${coach.username}** at **${time}**.`);
    } catch (err) {
      console.error(err);
      return interaction.reply("❌ Error booking session.");
    }
  }
};
