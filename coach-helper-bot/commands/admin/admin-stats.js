const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin-stats")
    .setDescription("View global bot statistics"),

  async execute(interaction) {
    try {
      const coaches = JSON.parse(fs.readFileSync("data/coaches.json", "utf8"));
      const sessions = JSON.parse(fs.readFileSync("data/sessions.json", "utf8"));
      const strikes = JSON.parse(fs.readFileSync("data/strikes.json", "utf8"));

      const embed = new EmbedBuilder()
        .setTitle("📈 Global Bot Stats")
        .setColor("Purple")
        .addFields(
          { name: "Coaches", value: `${coaches.length}`, inline: true },
          { name: "Sessions", value: `${sessions.length}`, inline: true },
          { name: "Strikes Issued", value: `${strikes.length}`, inline: true }
        );

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error loading stats.");
    }
  }
};
