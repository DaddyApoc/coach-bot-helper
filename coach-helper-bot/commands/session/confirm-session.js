const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("confirm-session")
    .setDescription("Confirm a booked session")
    .addStringOption(opt =>
      opt.setName("session_id")
        .setDescription("The session ID")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const sessionId = interaction.options.getString("session_id");
      const sessions = JSON.parse(fs.readFileSync("data/sessions.json", "utf8"));

      const session = sessions.find(s => s.id === sessionId);

      if (!session)
        return interaction.reply("❌ Session not found.");

      if (session.student !== interaction.user.id)
        return interaction.reply("❌ You are not the student for this session.");

      session.status = "confirmed";

      fs.writeFileSync("data/sessions.json", JSON.stringify(sessions, null, 2));

      return interaction.reply("✅ Session confirmed.");
    } catch (err) {
      console.error(err);
      return interaction.reply("❌ Error confirming session.");
    }
  }
};
