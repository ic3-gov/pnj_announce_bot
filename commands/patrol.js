const {
  PermissionFlagsBits,
  SlashCommandBuilder
} = require('discord.js');
const { getGuildSettings, savePatrol } = require('../storage');
const {
  parsePatrolDateTime,
  buildPatrolEmbed,
  buildPatrolButtons
} = require('../patrol-utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('patrol')
    .setDescription('Create a patrol announcement.')
    .addStringOption(option =>
      option
        .setName('aop')
        .setDescription('Area of patrol, for example Trenton, NJ.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('date')
        .setDescription('Patrol date in MM/DD/YYYY format.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('time')
        .setDescription('Patrol time, for example 7:30 PM.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('notes')
        .setDescription('Optional patrol notes.')
        .setRequired(false)
    ),

  async execute(interaction) {
    const settings = getGuildSettings(interaction.guildId);
    const member = interaction.member;

    const isAdmin = interaction.memberPermissions.has(PermissionFlagsBits.Administrator);
    const hasAuthorizedRole = (settings.authorizedRoles || []).some(roleId => member.roles.cache.has(roleId));

    if (!isAdmin && !hasAuthorizedRole) {
      return interaction.reply({ content: 'You are not authorized to use /patrol.', ephemeral: true });
    }

    if (!settings.patrolChannel) {
      return interaction.reply({ content: 'No patrol channel is configured. An administrator must use /setchannel first.', ephemeral: true });
    }

    if (!settings.notifiedRole) {
      return interaction.reply({ content: 'No patrol notification role is configured. An administrator must use /setnotifiedrole first.', ephemeral: true });
    }

    const channel = interaction.guild.channels.cache.get(settings.patrolChannel);
    if (!channel || !channel.isTextBased()) {
      return interaction.reply({ content: 'The configured patrol channel no longer exists. Use /setchannel to set a new one.', ephemeral: true });
    }

    const notifiedRole = interaction.guild.roles.cache.get(settings.notifiedRole);
    if (!notifiedRole) {
      return interaction.reply({ content: 'The configured patrol notification role no longer exists. Use /setnotifiedrole to set a new one.', ephemeral: true });
    }

    const aop = interaction.options.getString('aop', true).trim();
    const date = interaction.options.getString('date', true).trim();
    const time = interaction.options.getString('time', true).trim();
    const notes = interaction.options.getString('notes')?.trim() || 'N/A';

    const eventTimestamp = parsePatrolDateTime(date, time);
    if (!eventTimestamp) {
      return interaction.reply({
        content: 'I could not understand that date/time. Use `MM/DD/YYYY` for the date and something like `7:30 PM` for the time.',
        ephemeral: true
      });
    }

    const patrol = {
      guildId: interaction.guildId,
      channelId: channel.id,
      creatorId: interaction.user.id,
      creatorName: interaction.user.username,
      aop,
      notes,
      eventTimestamp,
      createdAt: Date.now(),
      accepted: [],
      tentative: [],
      declined: []
    };

    try {
      const message = await channel.send({
        content: `<@&${notifiedRole.id}>`,
        embeds: [buildPatrolEmbed(patrol)],
        components: [buildPatrolButtons()],
        allowedMentions: { roles: [notifiedRole.id] }
      });

      savePatrol(message.id, patrol);

      return interaction.reply({
        content: `Patrol announced in ${channel}.`,
        ephemeral: true
      });
    } catch (error) {
      console.error('Failed to post patrol:', error);
      return interaction.reply({
        content: 'I could not post the patrol announcement. Check my permissions in the configured channel.',
        ephemeral: true
      });
    }
  }
};
