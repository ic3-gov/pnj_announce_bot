const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, 'data');
const settingsPath = path.join(dataDir, 'settings.json');
const patrolsPath = path.join(dataDir, 'patrols.json');

function ensureFile(filePath) {
	if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, {
		recursive: true
	});
	if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '{}', 'utf8');
}

function readJson(filePath) {
	ensureFile(filePath);
	try {
		return JSON.parse(fs.readFileSync(filePath, 'utf8'));
	}
	catch (error) {
		console.error(`Failed to read ${filePath}:`, error);
		return {};
	}
}

function writeJson(filePath, data) {
	ensureFile(filePath);
	fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function getGuildSettings(guildId) {
	const all = readJson(settingsPath);
	return all[guildId] || {
		patrolChannel: null,
		notifiedRole: null,
		authorizedRoles: []
	};
}

function saveGuildSettings(guildId, settings) {
	const all = readJson(settingsPath);
	all[guildId] = settings;
	writeJson(settingsPath, all);
}

function getPatrol(messageId) {
	const all = readJson(patrolsPath);
	return all[messageId] || null;
}

function savePatrol(messageId, patrol) {
	const all = readJson(patrolsPath);
	all[messageId] = patrol;
	writeJson(patrolsPath, all);
}
module.exports = {
	getGuildSettings,
	saveGuildSettings,
	getPatrol,
	savePatrol
};