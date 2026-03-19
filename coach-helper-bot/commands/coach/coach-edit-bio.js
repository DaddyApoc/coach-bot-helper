const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coach-edit-bio")
    .setDescription("Edit your coach bio")
    .addStringOption(option =>
      option.setName("bio")
        .setDescription("Your new bio")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const bio = interaction.options.getString("bio");
      const coaches = JSON.parse(fs.readFileSync("data/coaches.json", "utf8"));

      const coach = coaches.find(c => c.id === interaction.user.id);
      if (!coach) return interaction.reply("❌ You are not registered as a coach.");

      coach.bio = bio;

      fs.writeFileSync("data/coaches.json", JSON.stringify(coaches, null, 2));

      await interaction.reply(`📝 Bio updated.`);
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error updating bio.");
    }
  }
};
 
