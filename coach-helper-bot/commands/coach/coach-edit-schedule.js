const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coach-edit-schedule")
    .setDescription("Update your schedule")
    .addStringOption(option =>
      option.setName("schedule")
        .setDescription("Your new schedule")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const schedule = interaction.options.getString("schedule");
      const coaches = JSON.parse(fs.readFileSync("data/coaches.json", "utf8"));

      const coach = coaches.find(c => c.id === interaction.user.id);
      if (!coach) return interaction.reply("❌ You are not registered as a coach.");

      coach.schedule = schedule;

      fs.writeFileSync("data/coaches.json", JSON.stringify(coaches, null, 2));

      await interaction.reply(`📅 Schedule updated.`);
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error updating schedule.");
    }
  }
};
