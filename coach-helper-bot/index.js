import { Client, GatewayIntentBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import fs from "fs";
import { loadTempProfile, saveTempProfile, deleteTempProfile } from "./utils/coachSetupStorage.js";

const coachesPath = "data/coaches.json";

// ... your existing client/login code

client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton()) {
    const id = interaction.customId;
    const coachId = interaction.user.id;

    // PAGE NAVIGATION
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

    // ABOUT ME multi-step (simplified into one modal with multiple fields)
    if (id === "coachsetup_about") {
      const modal = new ModalBuilder()
        .setCustomId("coachsetup_about_modal")
        .setTitle("About Me");

      const bio = new TextInputBuilder()
        .setCustomId("about_bio")
        .setLabel("Short bio")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const philosophy = new TextInputBuilder()
        .setCustomId("about_philosophy")
        .setLabel("Coaching philosophy")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

      const expect = new TextInputBuilder()
        .setCustomId("about_expect")
        .setLabel("What students can expect")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

      const background = new TextInputBuilder()
        .setCustomId("about_background")
        .setLabel("Background / experience")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

      const extra = new TextInputBuilder()
        .setCustomId("about_extra")
        .setLabel("Anything else?")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

      modal.addComponents(
        new ActionRowBuilder().addComponents(bio),
        new ActionRowBuilder().addComponents(philosophy),
        new ActionRowBuilder().addComponents(expect),
        new ActionRowBuilder().addComponents(background),
        new ActionRowBuilder().addComponents(extra)
      );

      return interaction.showModal(modal);
    }

    // You can add similar button→modal flows for specialties, weapons, etc.

    if (id === "coachsetup_preview") {
      const temp = loadTempProfile(coachId);

      const embed = new EmbedBuilder()
        .setTitle(`👀 Preview — ${temp.username || "Coach"}`)
        .setColor("Gold")
        .setDescription(temp.about || "No About Me set yet.")
        .addFields(
          { name: "Specialties", value: (temp.specialties || []).join(", ") || "None", inline: true },
          { name: "Weapons", value: (temp.weapons || []).join(", ") || "None", inline: true },
          { name: "Experience", value: temp.experience || "None", inline: false }
        );

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (id === "coachsetup_finish") {
      const temp = loadTempProfile(coachId);

      let coaches = [];
      if (fs.existsSync(coachesPath)) {
        coaches = JSON.parse(fs.readFileSync(coachesPath, "utf8"));
      }

      const existing = coaches.find(c => c.id === coachId);
      if (existing) {
        Object.assign(existing, temp);
      } else {
        coaches.push(temp);
      }

      fs.writeFileSync(coachesPath, JSON.stringify(coaches, null, 2));
      deleteTempProfile(coachId);

      return interaction.reply({
        content: "✅ Your coach profile has been saved.",
        ephemeral: true
      });
    }
  }

  if (interaction.isModalSubmit()) {
    const id = interaction.customId;
    const coachId = interaction.user.id;
    let temp = loadTempProfile(coachId);

    if (id === "coachsetup_about_modal") {
      const bio = interaction.fields.getTextInputValue("about_bio");
      const philosophy = interaction.fields.getTextInputValue("about_philosophy") || "";
      const expect = interaction.fields.getTextInputValue("about_expect") || "";
      const background = interaction.fields.getTextInputValue("about_background") || "";
      const extra = interaction.fields.getTextInputValue("about_extra") || "";

      temp.about =
        `**About Me**\n${bio}\n\n` +
        (philosophy ? `**Coaching Philosophy**\n${philosophy}\n\n` : "") +
        (expect ? `**What Students Can Expect**\n${expect}\n\n` : "") +
        (background ? `**Background**\n${background}\n\n` : "") +
        (extra ? `**Additional Notes**\n${extra}` : "");

      saveTempProfile(coachId, temp);

      return interaction.reply({ content: "✅ About Me updated.", ephemeral: true });
    }

    // You can add more modal handlers here for specialties, weapons, etc.
  }
});
postNewCoach(client, temp);

import { postNewCoach } from "./utils/communityWall.js";
// top of file

// inside interaction.isButton() handler:
if (id === "coachsetup_finish") {
  const coachId = interaction.user.id;
  const temp = loadTempProfile(coachId);

  // ensure verification flags exist
  if (typeof temp.verified === "undefined") temp.verified = false;
  if (typeof temp.denied === "undefined") temp.denied = false;

  let coaches = [];
  if (fs.existsSync(coachesPath)) {
    coaches = JSON.parse(fs.readFileSync(coachesPath, "utf8"));
  }

  const existing = coaches.find(c => c.id === coachId);
  if (existing) {
    Object.assign(existing, temp);
  } else {
    coaches.push(temp);
  }

  fs.writeFileSync(coachesPath, JSON.stringify(coaches, null, 2));
  deleteTempProfile(coachId);

  // DO NOT post to wall yet – only verified coaches go public
  // postNewCoach(client, temp);  // remove or keep commented

  // DM coach: pending approval
  try {
    await interaction.user.send(
      "📝 Your coach profile has been saved and is now **pending admin approval**.\n" +
      "You’ll be notified once you’re verified as one of **The Generals**."
    );
  } catch {}

  return interaction.reply({
    content: "✅ Your coach profile has been saved and is pending admin approval.",
    ephemeral: true
  });
}
