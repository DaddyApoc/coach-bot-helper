const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coach-edit-rating")
    .setDescription("Set your rating (admin override)")
    .addIntegerOption(option =>
      option.setName("rating")
        .setDescription("Rating 1–5")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const rating = interaction.options.getInteger("rating");
      if (rating < 1 || rating > 5)
        return interaction.reply("❌ Rating must be between 1 and 5.");

      const coaches = JSON.parse(fs.readFileSync("data/coaches.json", "utf8"));

      const coach = coaches.find(c => c.id === interaction.user.id);
      if (!coach) return interaction.reply("❌ You are not registered as a coach.");

      coach.rating = rating;

      fs.writeFileSync("data/coaches.json", JSON.stringify(coaches, null, 2));

      await interaction.reply(`⭐ Rating updated to **${rating}**.`);
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error updating rating.");
    }
  }
};
