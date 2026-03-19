const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coach-feedback")
    .setDescription("Leave feedback for a coach") 
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("Coach to review")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("feedback")
        .setDescription("Your feedback")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const coach = interaction.options.getUser("coach");
      const feedback = interaction.options.getString("feedback");

      const file = "data/feedback.json";
      if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify([]));

      const list = JSON.parse(fs.readFileSync(file, "utf8"));
      list.push({
        coachId: coach.id,
        studentId: interaction.user.id,
        feedback,
        date: new Date().toISOString()
      });

      fs.writeFileSync(file, JSON.stringify(list, null, 2));

      await interaction.reply(`📝 Feedback submitted for **${coach.username}**.`);
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error submitting feedback.");
    }
  }
};
