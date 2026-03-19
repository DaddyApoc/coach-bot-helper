const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.DISCORD_TOKEN; // IMPORTANT FIX

const commands = [];
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

const names = new Set();

// Load commands safely
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if (!command.data || !command.execute) {
            console.log(`[WARNING] Missing data/execute in ${file}`);
            continue;
        }

        const name = command.data.name;

        if (names.has(name)) {
            console.log(`[DUPLICATE BLOCKED] Command name already exists: ${name}`);
            continue;
        }

        names.add(name);
        commands.push(command.data.toJSON());
    }
}

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log("Wiping ALL global commands...");

        // TEMP: wipe all global commands
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: [] }
        );

        console.log("Global commands wiped successfully.");

        console.log(`Registering ${commands.length} guild commands...`);

        // Register guild commands (instant)
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        console.log("Guild commands updated successfully.");
    } catch (error) {
        console.error(error);
    }
})();
