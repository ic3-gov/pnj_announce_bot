const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder
} = require('discord.js');
const {
	DateTime
} = require('luxon');
const embedConfig = require('./embed.json');
const TIME_ZONE = 'America/New_York';

function parsePatrolDateTime(dateText, timeText) {
	const formats = ['M/d/yyyy h:mm a', 'M/d/yyyy h:mma', 'MM/dd/yyyy h:mm a', 'MM/dd/yyyy h:mma'];
	const combined = `${dateText.trim()} ${timeText.trim().toUpperCase()}`;
	for (const format of formats) {
		const parsed = DateTime.fromFormat(combined, format, {
			zone: TIME_ZONE,
			locale: 'en-US'
		});
		if (parsed.isValid) {
			return Math.floor(parsed.toSeconds());
		}
	}
	return null;
}

function formatUsers(userIds) {
	if (!userIds.length) return 'None';
	const mentions = userIds.map(id => `<@${id}>`);
	let output = '';
	let shown = 0;
	for (const mention of mentions) {
		const next = output ? `${output}\n${mention}` : mention;
		if (next.length > 950) break;
		output = next;
		shown++;
	}
	if (shown < mentions.length) {
		output += `\n+${mentions.length - shown} more`;
	}
	return output || 'None';
}

function buildPatrolEmbed(patrol) {
	const unix = patrol.eventTimestamp;
	return new EmbedBuilder().setColor(embedConfig.color).setTitle(embedConfig.title).addFields({
		name: 'Date:',
		value: `<t:${unix}:d>`,
		inline: true
	}, {
		name: 'Time:',
		value: `<t:${unix}:t>`,
		inline: true
	}, {
		name: 'AOP:',
		value: `${patrol.aop}\n-# <#${embedConfig.aopMapChannelId}>`,
		inline: true
	}, {
		name: 'Direct Connect:',
		value: `\`\`connect ${embedConfig.directConnect}\`\``,
		inline: true
	}, {
		name: 'Player Count:',
		value: `<#${embedConfig.playerCountChannelId}>`,
		inline: true
	}, {
		name: 'Patrol Notes:',
		value: patrol.notes || 'N/A'
	}, {
		name: `✅ Accepted (${patrol.accepted.length})`,
		value: formatUsers(patrol.accepted),
		inline: true
	}, {
		name: `❓ Tentative (${patrol.tentative.length})`,
		value: formatUsers(patrol.tentative),
		inline: true
	}, {
		name: `❌ Declined (${patrol.declined.length})`,
		value: formatUsers(patrol.declined),
		inline: true
	}).setThumbnail(embedConfig.thumbnailUrl).setFooter({
		text: `Announced by @${patrol.creatorName}`,
		iconURL: embedConfig.footerIconUrl
	}).setTimestamp(new Date(patrol.createdAt));
}

function buildPatrolButtons() {
	return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('patrol_accept').setLabel('Accept').setEmoji('✅').setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId('patrol_tentative').setLabel('Tentative').setEmoji('❓').setStyle(ButtonStyle.Primary), new ButtonBuilder().setCustomId('patrol_decline').setLabel('Decline').setEmoji('❌').setStyle(ButtonStyle.Danger));
}

function moveUserToResponse(patrol, userId, response) {
	patrol.accepted = patrol.accepted.filter(id => id !== userId);
	patrol.tentative = patrol.tentative.filter(id => id !== userId);
	patrol.declined = patrol.declined.filter(id => id !== userId);
	if (response === 'accept') {
		patrol.accepted.push(userId);
	}
	if (response === 'tentative') {
		patrol.tentative.push(userId);
	}
	if (response === 'decline') {
		patrol.declined.push(userId);
	}
	return patrol;
}
module.exports = {
	parsePatrolDateTime,
	buildPatrolEmbed,
	buildPatrolButtons,
	moveUserToResponse
};