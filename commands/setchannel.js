const {
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder
} = require('discord.js');
const { getGuildSettings, saveGuildSettings } = require('../storage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setchannel')
    .setDescription('Set the channel used for patrol announcements.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('The patrol announcement channel.')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: 'You need Administrator permission to use this command.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('channel', true);
    const settings = getGuildSettings(interaction.guildId);
    settings.patrolChannel = channel.id;
    saveGuildSettings(interaction.guildId, settings);

    return interaction.reply({ content: `Patrol announcements will now be posted in ${channel}.`, ephemeral: true });
  }
};
