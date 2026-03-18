import {
  SlashCommandBuilder,
  EmbedBuilder
} from "discord.js";
import fs from "fs";

const filePath = "/data/coaches.json";

function ensureFile() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}));
  }
}

export default {
  data: new SlashCommandBuilder()
    .setName("coach-search")
    .setDescription("Search for coaches by tag or weapon.")
    .addStringOption(option =>
      option.setName("query")
        .setDescription("Search term (tag or weapon)")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      ensureFile();
      const query = interaction.options.getString("query").toLowerCase();

      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const results = [];

      for (const [coachId, coach] of Object.entries(data)) {
        const tags = coach.tags || [];
        const weapons = coach.weapons || [];
        
        if (tags.some(t => t.toLowerCase().includes(query)) ||
            weapons.some(w => w.toLowerCase().includes(query))) {
          results.push({ id: coachId, ...coach });
        }
      }

      if (results.length === 0) {
        return interaction.reply({
          content: `❌ No coaches found matching "${query}".`,
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setTitle(`Search Results for "${query}"`)
        .setColor("Blue")
        .setDescription(results.map(c => `<@${c.id}> — ${c.bio || "No bio"}`).join("\n"));

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply("❌ Error searching coaches.");
    }
  }
};
