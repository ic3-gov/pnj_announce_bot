const {
  PermissionFlagsBits,
  SlashCommandBuilder
} = require('discord.js');
const { getGuildSettings, saveGuildSettings } = require('../storage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setnotifiedrole')
    .setDescription('Set the role pinged when a patrol is announced.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('The role to notify for patrol announcements.')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: 'You need Administrator permission to use this command.', ephemeral: true });
    }

    const role = interaction.options.getRole('role', true);
    const settings = getGuildSettings(interaction.guildId);
    settings.notifiedRole = role.id;
    saveGuildSettings(interaction.guildId, settings);

    return interaction.reply({ content: `${role} will now be notified when a patrol is announced.`, ephemeral: true });
  }
};
