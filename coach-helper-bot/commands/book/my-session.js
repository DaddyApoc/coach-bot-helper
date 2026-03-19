const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

const filePath = "data/sessions.json";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("complete-session")
    .setDescription("Mark a session as completed")
    .addIntegerOption(option =>
      option.setName("id")
        .setDescription("Session ID")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const id = interaction.options.getInteger("id");
      const sessions = JSON.parse(fs.readFileSync(filePath, "utf8"));

      const session = sessions.find(s => s.id === id);

      if (!session)
        return interaction.reply("❌ Session not found.");

      if (session.coachId !== interaction.user.id)
        return interaction.reply("❌ You can only complete your own sessions.");

      session.status = "completed";
      session.completedAt = new Date().toISOString();

      fs.writeFileSync(filePath, JSON.stringify(sessions, null, 2));

      await interaction.reply(`🏁 Session **${id}** marked as completed.`);
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error completing session.");
    }
  }
};
 
