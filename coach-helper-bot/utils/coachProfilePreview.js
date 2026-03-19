const { EmbedBuilder } = require("discord.js");

module.exports = function generateProfilePreview(coach, user) {
  return new EmbedBuilder()
    .setTitle(`👤 Coach Profile — ${user.username}`)
    .setColor("Blue")
    .addFields(
      { name: "Bio", value: coach.bio || "None" },
      { name: "Rank", value: coach.rank || "None", inline: true },
      { name: "Price", value: `${coach.price || 0} credits`, inline: true },
      { name: "Availability", value: coach.availability || "None" },
      { name: "Schedule", value: coach.schedule || "None" },
      { name: "Weapons", value: coach.weapons?.join(", ") || "None" },
      { name: "Tags", value: coach.tags?.join(", ") || "None" }
    )
    .setFooter({ text: "Coach Setup Wizard" });
};
