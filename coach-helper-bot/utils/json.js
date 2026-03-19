const fs = require("fs");

function ensureFile(path, defaultData) {
    try {
        if (!fs.existsSync(path)) {
            fs.writeFileSync(path, JSON.stringify(defaultData, null, 2));
            return defaultData;
        }

        const raw = fs.readFileSync(path, "utf8");

        if (!raw.trim()) {
            fs.writeFileSync(path, JSON.stringify(defaultData, null, 2));
            return defaultData;
        }

        return JSON.parse(raw);

    } catch (err) {
        console.error("JSON ERROR in", path, err);

        fs.writeFileSync(path, JSON.stringify(defaultData, null, 2));
        return defaultData;
    }
}

function saveFile(path, data) {
    try {
        fs.writeFileSync(path, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("SAVE ERROR in", path, err);
    }
}

module.exports = { ensureFile, saveFile };
