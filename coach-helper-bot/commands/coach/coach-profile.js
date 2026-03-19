const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coach-profile")
    .setDescription("View your coach profile"),

  async execute(interaction) {
    try {
      const coaches = JSON.parse(fs.readFileSync("data/coaches.json", "utf8"));
      const coach = coaches.find(c => c.id === interaction.user.id);

      if (!coach)
        return interaction.reply("❌ You are not registered as a coach.");

      const embed = new EmbedBuilder()
        .setTitle(`
