const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("student-dashboard")
    .setDescription("View your student dashboard"),

  async execute(interaction) {
    try {
      const userId = interaction.user.id;

      const sessions = JSON.parse(fs.readFileSync("data/sessions.json", "utf8"));
      const progress = JSON.parse(fs.readFileSync("data/progress.json", "utf8"));

      const mySessions = sessions.filter(s => s.studentId === userId);
      const myProgress = progress.filter(p => p.studentId === userId);

      const embed = new EmbedBuilder()
        .setTitle(`🎓 Student Dashboard — ${interaction.user.username}`)
        .setColor("Green")
        .addFields(
          { name: "Total Sessions", value: `${mySessions.length}`, inline: true },
          { name: "Progress Entries", value: `${myProgress.length}`, inline: true },
          { name: "Last Session", value: mySessions.length ? mySessions[mySessions.length - 1].date : "None" }
        );

      await interaction.reply({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error loading dashboard.");
    }
  }
};
