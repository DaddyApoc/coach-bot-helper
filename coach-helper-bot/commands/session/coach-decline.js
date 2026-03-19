const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coach-decline")
    .setDescription("Decline a pending session")
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

      if (session.coach !== interaction.user.id)
        return interaction.reply("❌ You are not the coach for this session.");

      session.status = "declined";

      fs.writeFileSync("data/sessions.json", JSON.stringify(sessions, null, 2));

      return interaction.reply("❌ Session declined.");
    } catch (err) {
      console.error(err);
      return interaction.reply("❌ Error declining session.");
    }
  }
};
