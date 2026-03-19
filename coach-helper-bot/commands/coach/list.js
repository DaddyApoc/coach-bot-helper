import { SlashCommandBuilder } from "discord.js";
import fs from "fs";

const filePath = "/data/coaches.json";

function ensureFile() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}));
  }
}

export default {
  data: new SlashCommandBuilder()
    .setName("coach-list")
    .setDescription("List all registered coaches"),

  async execute(interaction) {
    try {
      ensureFile();
      
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const entries = Object.entries(data);

      if (entries.length === 0) {
        return interaction.reply("There are no coaches registered yet.");
      }

      const list = entries
        .map(([id, coach]) => `<@${id}> — ${coach.bio}`)
        .join("\n");

      await interaction.reply(`📋 **Registered Coaches:**\n${list}`);
    } catch (error) {
      console.error(error);
      await interaction.reply("❌ Error listing coaches.");
    }
  }
};
