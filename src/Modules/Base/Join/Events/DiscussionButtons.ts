import { Interaction, Collection, TextChannel, EmbedBuilder, ThreadChannel, Message as DMsg, BitField, PermissionFlagsBits, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle, ThreadAutoArchiveDuration, ChannelType, APIActionRowComponent, APIButtonComponent } from "discord.js";
import App from "../../../../App";
import { ErrorEmbed, SuccesfulEmbed, footer, ProcessingEmbed } from "../../../../Data/Embeds";
import Logger from "../../../../types/Logger";
import DiscordEvent from "../../../../types/ModuleEvent/DiscordEvent";
import { ButtonActionRowAdmin, DiscussActionRow } from "../Buttons";
import { connectButton } from "../../../Common/Connect";
import { link } from "fs";

export default (app: App, logger: Logger) => new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
	if (!interaction.isButton()) return
	if (!interaction.customId.startsWith('join:discuss:')) return
	try {
		await interaction.deferReply()
		if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) return interaction.editReply({ embeds: [ErrorEmbed("Missing permissions.")] })
		let data = interaction.customId.split(':')
		let action = data[2]
		let reqID = data[3]
		let req = await app.prisma.request.findFirst({ where: { id: reqID } })
		if (!req) return await interaction.editReply({ embeds: [ErrorEmbed("Заявка не найдена (How did we get here?)")] })

		if (action == "close") {
			let thread = await app.bot.channels.fetch(interaction.channelId) as ThreadChannel
			await app.prisma.request.update({ where: { id: reqID }, data: { locked: false } })
			await interaction.editReply({ embeds: [SuccesfulEmbed("Обсуждение закрыто.")] })
			await thread.setLocked(true)
			await thread.setAutoArchiveDuration(ThreadAutoArchiveDuration.OneHour)
			const link = `https://discord.com/channels/${app.config.bot.guildId}/${thread.id}/${interaction.message.id}`;
			await interaction.message.edit({components: [ DiscussActionRow( reqID, true, link)]})
			await (await (await app.bot.users.fetch(req.discord)).createDM()).send({
				embeds: [new EmbedBuilder()
					.setColor(Colors.Yellow)
					.setTitle(`Обсуждение заявки закрыто.`)
					.setDescription("Ожидайте решение по заявке в ближайшее время.")
					.setTimestamp(Date.now())
					.setFooter(footer)]
			})
		}
	} catch (err) {
		logger.Error(err)
		interaction.isRepliable() && interaction.replied || interaction.deferred ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
	}
})
