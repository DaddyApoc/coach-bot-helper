const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-progress")
    .setDescription("Add progress to a session")
    .addStringOption(opt =>
      opt.setName("session_id")
        .setDescription("The session ID")
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("progress")
        .setDescription("Progress notes")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const sessionId = interaction.options.getString("session_id");
      const progress = interaction.options.getString("progress");

      const sessions = JSON.parse(fs.readFileSync("data/sessions.json", "utf8"));
      const session = sessions.find(s => s.id === sessionId);

      if (!session)
        return interaction.reply("❌ Session not found.");

      session.progress = session.progress || [];
      session.progress.push({
        coach: interaction.user.id,
        text: progress,
        date: new Date().toISOString()
      });

      fs.writeFileSync("data/sessions.json", JSON.stringify(sessions, null, 2));

      return interaction.reply("✅ Progress added.");
    } catch (err) {
      console.error(err);
      return interaction.reply("❌ Error adding progress.");
    }
  }
};
