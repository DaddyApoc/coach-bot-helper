const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coach-search")
    .setDescription("Search for coaches by specialty")
    .addStringOption(opt =>
      opt.setName("specialty")
        .setDescription("Specialty to search for")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const specialty = interaction.options.getString("specialty");
      const coaches = JSON.parse(fs.readFileSync("data/coaches.json", "utf8"));

      const results = coaches.filter(c =>
        c.specialties?.includes(specialty)
      );

      if (!results.length)
        return interaction.reply("❌ No coaches found with that specialty.");

      const embed = new EmbedBuilder()
        .setTitle(`🔍 Coaches specializing in ${specialty}`)
        .setColor("Purple")
        .addFields(
          results.map(c => ({
            name: c.username,
            value: `Experience: ${c.experience || "N/A"}\nLanguages: ${c.languages?.join(", ") || "N/A"}`,
            inline: false
          }))
        );

      return interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      return interaction.reply("❌ Error searching coaches.");
    }
  }
};
