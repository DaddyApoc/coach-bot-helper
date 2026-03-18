import { SlashCommandBuilder } from "discord.js";
import fs from "fs";

export default {
  data: new SlashCommandBuilder()
    .setName("coach-list")
    .setDescription("List all registered coaches"),

  async execute(interaction) {
    const filePath = "/data/coaches.json";
    
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({}));
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    const entries = Object.entries(data);

    if (entries.length === 0) {
      return interaction.reply("There are no coaches registered yet.");
    }

    const list = entries
      .map(([id, coach]) => `<@${id}> — ${coach.bio}`)
      .join("\n");

    await interaction.reply(`📋 **Registered Coaches:**\n${list}`);
  }
};
