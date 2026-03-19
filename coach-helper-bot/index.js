import {
  Client,
  GatewayIntentBits,
  Collection,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} from "discord.js";

import fs from "fs";
import path from "path";

import { loadTempProfile, saveTempProfile, deleteTempProfile } from "./utils/coachSetupStorage.js";

const coachesPath = "data/coaches.json";

// -------------------------
// CLIENT SETUP
// -------------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

// -------------------------
// COMMAND LOADER
// -------------------------
const commandsPath = path.join(process.cwd(), "commands");
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith(".js"));

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const command = (await import(`file://${filePath}`)).default;

    if (command?.data && command?.execute) {
      client.commands.set(command.data.name, command);
    }
  }
}

// -------------------------
// READY EVENT
// -------------------------
client.once("ready", () => {
  console.log(`Bot logged in as ${client.user.tag}`);
});

// -------------------------
// INTERACTION HANDLER
// -------------------------
client.on("interactionCreate", async interaction => {

  // -------------------------
  // SLASH COMMANDS
  // -------------------------
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      if (!interaction.replied) {
        interaction.reply({ content: "❌ Error executing command.", ephemeral: true });
      }
    }
    return;
  }

  // -------------------------
  // BUTTON HANDLER (Coach Setup)
  // -------------------------
  if (interaction.isButton()) {
    const id = interaction.customId;
    const coachId = interaction.user.id;

    // PAGE 1
    if (id === "coachsetup_page1") {
      const embed = new EmbedBuilder()
        .setTitle("🏗 Coach Profile Setup — Page 1/3")
        .setDescription("Core profile info.")
        .setColor("Blue");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("coachsetup_about").setLabel("About Me").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("coachsetup_specialties").setLabel("Specialties").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("coachsetup_weapons").setLabel("Weapons").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("coachsetup_experience").setLabel("Experience").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("coachsetup_languages").setLabel("Languages").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("coachsetup_page2").setLabel("Next ▶").setStyle(ButtonStyle.Success)
      );

      return interaction.update({ embeds: [embed], components: [row] });
    }

    // PAGE 2
    if (id === "coachsetup_page2") {
      const embed = new EmbedBuilder()
        .setTitle("🏗 Coach Profile Setup — Page 2/3")
        .setDescription("Media & credentials.")
        .setColor("Blue");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("coachsetup_clips").setLabel("Highlight Clips").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("coachsetup_certs").setLabel("Certifications").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("coachsetup_achievements").setLabel("Achievements").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("coachsetup_socials").setLabel("Social Links").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("coachsetup_banner").setLabel("Profile Banner").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("coachsetup_page3").setLabel("Next ▶").setStyle(ButtonStyle.Success)
      );

      return interaction.update({ embeds: [embed], components: [row] });
    }

    // PAGE 3
    if (id === "coachsetup_page3") {
      const embed = new EmbedBuilder()
        .setTitle("🏗 Coach Profile Setup — Page 3/3")
        .setDescription("Pricing, availability, and finish.")
        .setColor("Blue");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("coachsetup_pricing").setLabel("Pricing Tiers").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("coachsetup_availability").setLabel("Availability").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("coachsetup_preview").setLabel("Preview Profile").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("coachsetup_finish").setLabel("Finish ✅").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("coachsetup_page1").setLabel("◀ Back").setStyle(ButtonStyle.Secondary)
      );

      return interaction.update({ embeds: [embed], components: [row] });
    }

    // ABOUT ME MODAL
    if (id === "coachsetup_about") {
      const modal = new ModalBuilder()
        .setCustomId("coachsetup_about_modal")
        .setTitle("About Me");

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("about_bio")
            .setLabel("Short bio")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
        )
      );

      return interaction.showModal(modal);
    }

    // PREVIEW
    if (id === "coachsetup_preview") {
      const temp = loadTempProfile(coachId);

      const embed = new EmbedBuilder()
        .setTitle(`👀 Preview — ${temp.username || "Coach"}`)
        .setColor("Gold")
        .setDescription(temp.about || "No About Me set yet.");

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // FINISH
    if (id === "coachsetup_finish") {
      const temp = loadTempProfile(coachId);

      if (typeof temp.verified === "undefined") temp.verified = false;
      if (typeof temp.denied === "undefined") temp.denied = false;

      let coaches = [];
      if (fs.existsSync(coachesPath)) {
        coaches = JSON.parse(fs.readFileSync(coachesPath, "utf8"));
      }

      const existing = coaches.find(c => c.id === coachId);
      if (existing) Object.assign(existing, temp);
      else coaches.push(temp);

      fs.writeFileSync(coachesPath, JSON.stringify(coaches, null, 2));
      deleteTempProfile(coachId);

      try {
        await interaction.user.send(
          "📝 Your coach profile has been saved and is now **pending admin approval**."
        );
      } catch {}

      return interaction.reply({
        content: "✅ Your coach profile has been saved and is pending admin approval.",
        ephemeral: true
      });
    }
  }

  // -------------------------
  // MODAL HANDLER
  // -------------------------
  if (interaction.isModalSubmit()) {
    const id = interaction.customId;
    const coachId = interaction.user.id;
    let temp = loadTempProfile(coachId);

    if (id === "coachsetup_about_modal") {
      const bio = interaction.fields.getTextInputValue("about_bio");

      temp.about = `**About Me**\n${bio}`;
      saveTempProfile(coachId, temp);

      return interaction.reply({ content: "✅ About Me updated.", ephemeral: true });
    }
  }
});

// -------------------------
// LOGIN
// -------------------------
client.login(process.env.TOKEN);
