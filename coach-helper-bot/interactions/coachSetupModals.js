const fs = require("fs");

module.exports = async function handleCoachSetupModals(interaction) {
  if (!interaction.isModalSubmit()) return; 

  const id = interaction.customId;
  const value = interaction.fields.getTextInputValue("value");
  const userId = interaction.user.id;

  const file = "data/coaches.json";
  const coaches = JSON.parse(fs.readFileSync(file, "utf8"));
  const coach = coaches.find(c => c.id === userId);

  if (!coach) {
    return interaction.reply({ content: "❌ You are not registered as a coach.", ephemeral: true });
  }

  const map = {
    modal_bio: "bio",
    modal_rank: "rank",
    modal_weapons: "weapons",
    modal_tags: "tags",
    modal_price: "price",
    modal_availability: "availability",
    modal_schedule: "schedule"
  };

  const field = map[id];
  if (!field) return;

  // Parse arrays
  if (field === "weapons" || field === "tags") {
    coach[field] = value.split(",").map(v => v.trim());
  }
  // Parse price
  else if (field === "price") {
    coach[field] = parseInt(value);
  }
  // Normal text fields
  else {
    coach[field] = value;
  }

  fs.writeFileSync(file, JSON.stringify(coaches, null, 2));

  await interaction.reply({
    content: `✅ Updated **${field}**.`,
    ephemeral: true
  });
};
