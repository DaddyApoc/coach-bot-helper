const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin-suspend")
    .setDescription("Suspend a coach")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("Coach to suspend")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const coach = interaction.options.getUser("coach");
      const coaches = JSON.parse(fs.readFileSync("data/coaches.json", "utf8"));

      const target = coaches.find(c => c.id === coach.id);
      if (!target) return interaction.reply("❌ Coach not found.");

      target.suspended = true;

      fs.writeFileSync("data/coaches.json", JSON.stringify(coaches, null, 2));

      await interaction.reply(`⛔ **${coach.username}** has been suspended.`);
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error suspending coach.");
    }
  }
};
