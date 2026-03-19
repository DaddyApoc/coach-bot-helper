const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coach-edit-price")
    .setDescription("Set your coaching price")
    .addIntegerOption(option =>
      option.setName("price")
        .setDescription("Price per session")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const price = interaction.options.getInteger("price");
      const coaches = JSON.parse(fs.readFileSync("data/coaches.json", "utf8"));

      const coach = coaches.find(c => c.id === interaction.user.id);
      if (!coach) return interaction.reply("❌ You are not registered as a coach.");

      coach.price = price;

      fs.writeFileSync("data/coaches.json", JSON.stringify(coaches, null, 2));

      await interaction.reply(`💵 Price updated to **${price} credits**.`);
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error updating price.");
    }
  }
}; 
