const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coach-edit-rank")
    .setDescription("Update your rank")
    .addStringOption(option =>
      option.setName("rank")
        .setDescription("Your new rank")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const rank = interaction.options.getString("rank");
      const coaches = JSON.parse(fs.readFileSync("data/coaches.json", "utf8"));

      const coach = coaches.find(c => c.id === interaction.user.id);
      if (!coach) return interaction.reply("❌ You are not registered as a coach.");

      coach.rank = rank;

      fs.writeFileSync("data/coaches.json", JSON.stringify(coaches, null, 2));

      await interaction.reply(`🏅 Rank updated to **${rank}**.`);
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error updating rank.");
    }
  }
};
