const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin-deny")
    .setDescription("Deny a coach application")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("Coach to deny")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const coach = interaction.options.getUser("coach");

      const coaches = JSON.parse(fs.readFileSync("data/coaches.json", "utf8"));
      const updated = coaches.filter(c => c.id !== coach.id);

      fs.writeFileSync("data/coaches.json", JSON.stringify(updated, null, 2));

      await interaction.reply(`❌ **${coach.username}** has been denied.`);
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error denying coach.");
    }
  }
};
