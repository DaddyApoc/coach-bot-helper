import { SlashCommandBuilder } from "discord.js";
import fs from "fs";

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
    const filePath = "/data/coaches.json";
    
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({}));
    }
    
    const user = interaction.options.getUser("user");
    const bio = interaction.options.getString("bio");

    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    data[user.id] = { bio };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    await interaction.reply(`✅ **${user.username}** has been added as a coach.`);
  }
};
