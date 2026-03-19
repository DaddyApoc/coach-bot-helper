const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove a progress entry")
    .addIntegerOption(option =>
      option.setName("index")
        .setDescription("Entry number to remove")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const index = interaction.options.getInteger("index") - 1;

      const file = "data/progress.json";
      const progress = JSON.parse(fs.readFileSync(file, "utf8"));

      if (!progress[index]) {
        return interaction.reply("❌ Invalid entry number.");
      }

      progress.splice(index, 1);
      fs.writeFileSync(file, JSON.stringify(progress, null, 2));

      await interaction.reply(`🗑️ Removed progress entry #${index + 1}.`);

    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error removing entry.");
    }
  }
};
