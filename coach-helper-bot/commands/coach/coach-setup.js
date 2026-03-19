const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coach-setup")
    .setDescription("Start the interactive coach setup wizard"),

  async execute(interaction) {
    try {
      const userId = interaction.user.id;

      // Ensure coach profile exists 
      const file = "data/coaches.json";
      if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify([]));

      const coaches = JSON.parse(fs.readFileSync(file, "utf8"));
      let coach = coaches.find(c => c.id === userId);

      if (!coach) {
        coach = {
          id: userId,
          username: interaction.user.username,
          bio: "",
          rank: "",
          weapons: [],
          tags: [],
          price: 0,
          availability: "",
          schedule: "",
          createdAt: new Date().toISOString()
        };
        coaches.push(coach);
        fs.writeFileSync(file, JSON.stringify(coaches, null, 2));
      }

      const embed = new EmbedBuilder()
        .setTitle("🧩 Coach Setup Wizard")
        .setDescription("Use the buttons below to configure your coach profile.")
        .setColor("Blue");

      const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("edit_bio").setLabel("Edit Bio").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("edit_rank").setLabel("Edit Rank").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("edit_weapons").setLabel("Edit Weapons").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("edit_tags").setLabel("Edit Tags").setStyle(ButtonStyle.Primary),
      );

      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("edit_price").setLabel("Edit Price").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("edit_availability").setLabel("Edit Availability").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("edit_schedule").setLabel("Edit Schedule").setStyle(ButtonStyle.Secondary),
      );

      const row3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("preview_profile").setLabel("Preview Profile").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("finish_setup").setLabel("Finish").setStyle(ButtonStyle.Danger)
      );

      await interaction.reply({
        embeds: [embed],
        components: [row1, row2, row3]
      });

    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error starting setup wizard.");
    }
  }
};
