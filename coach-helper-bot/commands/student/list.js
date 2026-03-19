const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("list")
    .setDescription("List students or progress entries")
    .addStringOption(option =>
      option.setName("type")
        .setDescription("What to list")
        .addChoices(
          { name: "Students", value: "students" },
          { name: "Progress", value: "progress" }
        )
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const type = interaction.options.getString("type");

      if (type === "students") {
        const coaches = JSON.parse(fs.readFileSync("data/coaches.json", "utf8"));
        const embed = new EmbedBuilder()
          .setTitle("🎓 Students")
          .setColor("Blue");

        coaches.forEach(c => {
          embed.addFields({
            name: c.username,
            value: `ID: ${c.id}`
          });
        });

        return interaction.reply({ embeds: [embed] });
      }

      if (type === "progress") {
        const progress = JSON.parse(fs.readFileSync("data/progress.json", "utf8"));
        const embed = new EmbedBuilder()
          .setTitle("📘 Progress Entries")
          .setColor("Green");

        progress.slice(-10).reverse().forEach((p, i) => {
          embed.addFields({
            name: `Entry ${i + 1}`,
            value:
              `**Student:** <@${p.studentId}>\n` +
              `**Coach:** <@${p.coachId}>\n` +
              `**Weapon:** ${p.weapon}\n` +
              `**Improvement:** ${p.improvement}`
          });
        });

        return interaction.reply({ embeds: [embed] });
      }

    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error listing data.");
    }
  }
};
