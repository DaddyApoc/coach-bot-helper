import { SlashCommandBuilder } from "discord.js";
import fs from "fs";

const filePath = "data/coaches.json";

function ensureFile() {
  if (!fs.existsSync("data")) fs.mkdirSync("data", { recursive: true });
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
}

export default {
  data: new SlashCommandBuilder()
    .setName("coach-add")
    .setDescription("Add a coach to the system")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("The coach to add")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("bio")
        .setDescription("Short coach bio")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      ensureFile();
      
      const user = interaction.options.getUser("user");
      const bio = interaction.options.getString("bio");

      const coaches = JSON.parse(fs.readFileSync(filePath, "utf8"));
      
      const coach = {
        id: user.id,
        username: user.username,
        bio,
        verified: false,
        suspended: false,
        createdAt: new Date().toISOString()
      };
      
      coaches.push(coach);
      fs.writeFileSync(filePath, JSON.stringify(coaches, null, 2));

      await interaction.reply(`✅ **${user.username}** has been added as a coach.`);
    } catch (error) {
      console.error(error);
      await interaction.reply("❌ Error adding coach.");
    }
  }
};
