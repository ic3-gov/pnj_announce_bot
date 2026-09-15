const {
  PermissionFlagsBits,
  SlashCommandBuilder
} = require('discord.js');
const { getGuildSettings, saveGuildSettings } = require('../storage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('authorizerole')
    .setDescription('Manage roles allowed to use /patrol.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Authorize a role to use /patrol.')
        .addRoleOption(option =>
          option
            .setName('role')
            .setDescription('The role to authorize.')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove a role from the authorized list.')
        .addRoleOption(option =>
          option
            .setName('role')
            .setDescription('The role to remove.')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List all roles authorized to use /patrol.')
    ),

  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: 'You need Administrator permission to use this command.', ephemeral: true });
    }

    const settings = getGuildSettings(interaction.guildId);
    settings.authorizedRoles = settings.authorizedRoles || [];

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'add') {
      const role = interaction.options.getRole('role', true);

      if (settings.authorizedRoles.includes(role.id)) {
        return interaction.reply({ content: `${role} is already authorized.`, ephemeral: true });
      }

      settings.authorizedRoles.push(role.id);
      saveGuildSettings(interaction.guildId, settings);
      return interaction.reply({ content: `${role} can now use /patrol.`, ephemeral: true });
    }

    if (subcommand === 'remove') {
      const role = interaction.options.getRole('role', true);

      if (!settings.authorizedRoles.includes(role.id)) {
        return interaction.reply({ content: `${role} is not currently authorized.`, ephemeral: true });
      }

      settings.authorizedRoles = settings.authorizedRoles.filter(id => id !== role.id);
      saveGuildSettings(interaction.guildId, settings);
      return interaction.reply({ content: `${role} can no longer use /patrol.`, ephemeral: true });
    }

    const validRoles = settings.authorizedRoles
      .map(id => interaction.guild.roles.cache.get(id))
      .filter(Boolean);

    if (!validRoles.length) {
      return interaction.reply({ content: 'No roles are currently authorized to use /patrol.', ephemeral: true });
    }

    return interaction.reply({
      content: `Authorized patrol roles:\n${validRoles.map(role => `• ${role}`).join('\n')}`,
      ephemeral: true
    });
  }
};
