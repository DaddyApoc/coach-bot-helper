const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coach-accept")
    .setDescription("Accept a pending session request")
    .addIntegerOption(option =>
      option.setName("id")
        .setDescription("Session ID")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const id = interaction.options.getInteger("id");
      const sessions = JSON.parse(fs.readFileSync("data/sessions.json", "utf8"));

      const session = sessions.find(s => s.id === id);

      if (!session)
        return interaction.reply("❌ Session not found.");

      if (session.coachId !== interaction.user.id)
        return interaction.reply("❌ You can only accept your own session requests.");

      session.status = "accepted";
      fs.writeFileSync("data/sessions.json", JSON.stringify(sessions, null, 2));

      await interaction.reply(`✅ Session **${id}** accepted.`);
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error accepting session.");
    }
  }
};
