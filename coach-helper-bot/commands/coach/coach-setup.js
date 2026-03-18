import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { loadTempProfile, saveTempProfile } from "../../utils/coachSetupStorage.js";
import fs from "fs";

const coachesPath = "data/coaches.json";

export default {
  data: new SlashCommandBuilder()
    .setName("coach-setup")
    .setDescription("Open the interactive coach profile setup wizard."),

  async execute(interaction) {
    const coachId = interaction.user.id;
    let temp = loadTempProfile(coachId);

    if (!temp.id) {
      temp.id = coachId;
      temp.username = interaction.user.username;
      saveTempProfile(coachId, temp);
    }

    const embed = new EmbedBuilder()
      .setTitle("🏗 Coach Profile Setup — Page 1/3")
      .setDescription("Use the buttons below to fill out your profile.\nYou can come back and edit anytime.")
      .setColor("Blue");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("coachsetup_about").setLabel("About Me").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("coachsetup_specialties").setLabel("Specialties").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("coachsetup_weapons").setLabel("Weapons").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("coachsetup_experience").setLabel("Experience").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("coachsetup_languages").setLabel("Languages").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("coachsetup_page2").setLabel("Next ▶").setStyle(ButtonStyle.Success)
    );

    return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
};
