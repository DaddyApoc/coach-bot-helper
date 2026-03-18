import {
  SlashCommandBuilder,
  EmbedBuilder
} from "discord.js";
import fs from "fs";

const filePath = "/data/coaches.json";

function ensureFile() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}));
  }
}

export default {
  data: new SlashCommandBuilder()
    .setName("coach-info")
    .setDescription("View a coach's full profile.")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("The coach to view")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      ensureFile();
      const coachUser = interaction.options.getUser("coach");

      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const coach = data[coachUser.id];

      if (!coach) {
        return interaction.reply({
          content: "❌ That coach is not registered.",
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle(`${coachUser.username}'s Coaching Profile`)
        .setThumbnail(coachUser.displayAvatarURL())
        .setColor("White")
        .addFields(
          { name: "Bio", value: coach.bio || "No bio set." },
          { name: "Rank", value: coach.rank || "Not set", inline: true },
          { name: "Price", value: coach.price ? `$${coach.price}` : "Not set", inline: true },
          { name: "Rating", value: coach.rating ? `${coach.rating} ⭐` : "No rating", inline: true },
          { name: "Weapons", value: coach.weapons?.length ? coach.weapons.join(", ") : "None listed" },
          { name: "Availability", value: coach.availability || "Not set", inline: true },
          { name: "Schedule", value: coach.schedule || "Not set", inline: true },
          { name: "Tags", value: coach.tags?.length ? coach.tags.join(", ") : "No tags" }
        );

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply("❌ Error retrieving coach info.");
    }
  }
};
