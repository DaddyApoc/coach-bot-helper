import "dotenv/config";
import { REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Debug marker so we know Railway is using THIS file
console.log(">>> USING NEW DEPLOY FILE <<<");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];
const foldersPath = path.join(__dirname, "commands");

// Read all folders inside /commands
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);

    try {
      const command = (await import(`file://${filePath}`)).default;

      if (command?.data) {
        const json = command.data.toJSON();

        // ⭐ LOG COMMAND INDEX + NAME
        console.log(`[${commands.length}] Loaded command: ${json.name}`);

        commands.push(json);
      } else {
        console.log(`⚠️ Skipped (no data): ${file}`);
      }
    } catch (err) {
      console.log(`❌ Failed to load command file: ${file}`);
      console.error(err);
    }
  }
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("🔁 Refreshing guild (/) commands...");

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );

    console.log("✅ Successfully reloaded guild (/) commands.");
  } catch (error) {
    console.error("❌ Error updating commands:");
    console.error(error);
  }
})();
