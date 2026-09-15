require('dotenv').config();
const fs = require('fs');
const path = require('path');
const {
	Client,
	Collection,
	Events,
	GatewayIntentBits
} = require('discord.js');
const {
	getPatrol,
	savePatrol
} = require('./storage');
const {
	buildPatrolEmbed,
	buildPatrolButtons,
	moveUserToResponse
} = require('./patrol-utils');
if (!process.env.TOKEN) {
	console.error('Missing TOKEN in .env');
	process.exit(1);
}
const client = new Client({
	intents: [GatewayIntentBits.Guilds]
});
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(path.join(commandsPath, file));
	client.commands.set(command.data.name, command);
}
client.once(Events.ClientReady, readyClient => {
	console.log(`Logged in as ${readyClient.user.tag}`);
});
client.on(Events.InteractionCreate, async interaction => {
	try {
		if (interaction.isChatInputCommand()) {
			const command = client.commands.get(interaction.commandName);
			if (!command) return;
			await command.execute(interaction);
			return;
		}
		if (!interaction.isButton()) return;
		if (!interaction.customId.startsWith('patrol_')) return;
		const patrol = getPatrol(interaction.message.id);
		if (!patrol) {
			return interaction.reply({
				content: 'This patrol is no longer stored by the bot.',
				ephemeral: true
			});
		}
		const response = interaction.customId.replace('patrol_', '');
		moveUserToResponse(patrol, interaction.user.id, response);
		savePatrol(interaction.message.id, patrol);
		await interaction.update({
			embeds: [buildPatrolEmbed(patrol)],
			components: [buildPatrolButtons()]
		});
	}
	catch (error) {
		console.error('Interaction error:', error);
		if (interaction.isRepliable()) {
			const payload = {
				content: 'Something went wrong while handling that interaction.',
				ephemeral: true
			};
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp(payload).catch(() => {});
			}
			else {
				await interaction.reply(payload).catch(() => {});
			}
		}
	}
});
client.login(process.env.TOKEN);