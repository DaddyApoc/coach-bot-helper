const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = { 
  data: new SlashCommandBuilder()
    .setName("coach-edit-tags")
    .setDescription("Update your coaching tags")
    .addStringOption(option =>
      option.setName("tags")
        .setDescription("Comma-separated tags")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const tags = interaction.options.getString("tags").split(",").map(t => t.trim());
      const coaches = JSON.parse(fs.readFileSync("data/coaches.json", "utf8"));

      const coach = coaches.find(c => c.id === interaction.user.id);
      if (!coach) return interaction.reply("❌ You are not registered as a coach.");

      coach.tags = tags;

      fs.writeFileSync("data/coaches.json", JSON.stringify(coaches, null, 2));

      await interaction.reply(`🏷️ Tags updated.`);
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error updating tags.");
    }
  }
};
