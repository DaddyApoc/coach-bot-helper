const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coach-dashboard")
    .setDescription("View your coaching dashboard"),

  async execute(interaction) {
    try {
      const coachId = interaction.user.id;

      const sessions = JSON.parse(fs.readFileSync("data/sessions.json", "utf8"));
      const earnings = JSON.parse(fs.readFileSync("data/earnings.json", "utf8"));
      const strikes = JSON.parse(fs.readFileSync("data/strikes.json", "utf8"));

      const mySessions = sessions.filter(s => s.coachId === coachId);
      const myStrikes = strikes.filter(s => s.coachId === coachId);

      const embed = new EmbedBuilder()
        .setTitle(`📊 Coach Dashboard — ${interaction.user.username}`)
        .setColor("Blue")
        .addFields(
          { name: "Total Sessions", value: `${mySessions.length}`, inline: true },
          { name: "Earnings", value: `${earnings[coachId] || 0} credits`, inline: true },
          { name: "Strikes", value: `${myStrikes.length}`, inline: true }
        );

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error loading dashboard.");
    }
  }
};
