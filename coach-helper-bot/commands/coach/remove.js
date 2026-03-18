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
    .setName("coach-remove")
    .setDescription("Remove a coach from the system")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("The coach to remove")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      ensureFile();
      
      const user = interaction.options.getUser("user");
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

      if (!data[user.id]) {
        return interaction.reply(`❌ ${user.username} is not registered as a coach.`);
      }

      delete data[user.id];
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

      await interaction.reply(`🗑️ **${user.username}** has been removed from the coach list.`);
    } catch (error) {
      console.error(error);
      await interaction.reply("❌ Error removing coach.");
    }
  }
};
