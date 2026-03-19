const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-progress")
    .setDescription("Add a progress entry for a student")
    .addUserOption(option =>
      option.setName("student")
        .setDescription("Student to update")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("weapon")
        .setDescription("Weapon trained")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("improvement")
        .setDescription("Improvement summary")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("notes")
        .setDescription("Additional notes")
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      const student = interaction.options.getUser("student");
      const weapon = interaction.options.getString("weapon");
      const improvement = interaction.options.getString("improvement");
      const notes = interaction.options.getString("notes") || "None";

      const file = "data/progress.json";
      if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify([]));

      const progress = JSON.parse(fs.readFileSync(file, "utf8"));

      progress.push({
        studentId: student.id,
        coachId: interaction.user.id,
        weapon,
        improvement,
        notes,
        date: new Date().toISOString()
      });

      fs.writeFileSync(file, JSON.stringify(progress, null, 2));

      await interaction.reply(
        `📘 Progress added for **${student.username}** under **${weapon}**.`
      );

    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error adding progress.");
    }
  }
};
