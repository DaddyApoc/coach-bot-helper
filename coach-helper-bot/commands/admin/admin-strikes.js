const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin-strikes")
    .setDescription("View all strikes for a coach")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("Coach to view")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const coach = interaction.options.getUser("coach");
      const strikes = JSON.parse(fs.readFileSync("data/strikes.json", "utf8"))
        .filter(s => s.coachId === coach.id);

      if (strikes.length === 0)
        return interaction.reply(`✅ **${coach.username}** has no strikes.`);

      const embed = new EmbedBuilder()
        .setTitle(`⚠️ Strikes for ${coach.username}`)
        .setColor("Red");

      strikes.forEach((s, i) => {
        embed.addFields({
          name: `Strike ${i + 1}`,
          value: `**Reason:** ${s.reason}\n**Date:** ${s.date}`
        });
      });

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error loading strikes.");
    }
  }
};
