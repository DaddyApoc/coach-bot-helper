const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin-unsuspend")
    .setDescription("Unsuspend a coach")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("Coach to unsuspend")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const coach = interaction.options.getUser("coach");
      const coaches = JSON.parse(fs.readFileSync("data/coaches.json", "utf8"));

      const target = coaches.find(c => c.id === coach.id);
      if (!target) return interaction.reply("❌ Coach not found.");

      target.suspended = false;

      fs.writeFileSync("data/coaches.json", JSON.stringify(coaches, null, 2));

      await interaction.reply(`✅ **${coach.username}** has been unsuspended.`);
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error unsuspending coach.");
    }
  }
};
