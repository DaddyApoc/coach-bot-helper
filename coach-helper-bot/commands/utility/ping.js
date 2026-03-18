import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check if Coach helper.exe is alive"),

  async execute(interaction) {
    await interaction.reply("🏓 Coach helper.exe is online and responsive.");
  }
};
