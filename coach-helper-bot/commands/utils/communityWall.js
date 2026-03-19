import fs from "fs";
import { EmbedBuilder } from "discord.js";

const communityPath = "data/community.json";

function getWallChannel(client) {
  if (!fs.existsSync(communityPath)) return null;
  const config = JSON.parse(fs.readFileSync(communityPath, "utf8"));
  if (!config.coachWallChannel) return null;
  return client.channels.cache.get(config.coachWallChannel);
}

export async function postNewCoach(client, coach) {
  const channel = getWallChannel(client);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle("🎉 New Coach Joined!")
    .setColor("Green")
    .setDescription(`**${coach.username}** has completed their coach profile.`)
    .addFields(
      { name: "Specialties", value: (coach.specialties || []).join(", ") || "None" },
      { name: "Weapons", value: (coach.weapons || []).join(", ") || "None" }
    )
    .setTimestamp();

  if (coach.banner) embed.setImage(coach.banner);

  channel.send({ embeds: [embed] });
}

export async function postNewReview(client, feedback) {
  const channel = getWallChannel(client);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle("⭐ New Coach Review")
    .setColor("Yellow")
    .setDescription(`**${feedback.studentName}** rated **${feedback.coachName}**`)
    .addFields(
      { name: "Rating", value: `${feedback.rating}⭐`, inline: true },
      { name: "Comment", value: feedback.comment || "No comment" }
    )
    .setTimestamp();

  channel.send({ embeds: [embed] });
}

export async function postSessionComplete(client, booking) {
  const channel = getWallChannel(client);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle("📘 Session Completed")
    .setColor("Blue")
    .setDescription(`**${booking.coachName}** completed a session with **${booking.studentName}**`)
    .addFields(
      { name: "Weapon", value: booking.weapon || "Unknown", inline: true },
      { name: "Time", value: booking.time, inline: true }
    )
    .setTimestamp();

  channel.send({ embeds: [embed] });
}
