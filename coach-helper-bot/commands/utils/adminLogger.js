import fs from "fs";
import { EmbedBuilder } from "discord.js";

const adminConfigPath = "data/adminConfig.json";

export function getLogChannel(client) {
  if (!fs.existsSync(adminConfigPath)) return null;
  const config = JSON.parse(fs.readFileSync(adminConfigPath, "utf8"));
  if (!config.logChannel) return null;
  return client.channels.cache.get(config.logChannel);
}

export async function logAdminEvent(client, title, description, color = "Red") {
  const channel = getLogChannel(client);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp();

  channel.send({ embeds: [embed] });
}
