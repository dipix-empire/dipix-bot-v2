import { ChannelType, ContextMenuCommandType, ContextMenuCommandBuilder, GuildChannel, Interaction, SlashCommandBuilder, SlashCommandChannelOption, ThreadChannel, ApplicationCommandType, PermissionFlagsBits, ThreadAutoArchiveDuration } from "discord.js";
import App from "../../App";
import AppBusModuleComponent from "../../types/AppBus/ModuleComponent";
import Logger from "../../types/Logger";
import Module from "../../types/Module";
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent";
import { ErrorEmbed, SuccesfulEmbed } from "../../Data/Embeds";

export default new Module("Threads", (app: App, appBusModule: AppBusModuleComponent, logger: Logger) => {

	logger.Verbose(app.bot.uploadSlashCommand("main", (slashCommand: SlashCommandBuilder) => slashCommand
		.setName("alwaysactive")
		.setDescription("Запрещает архивирование ветки (Повторное применение отменяет действие)")
		.addChannelOption((channel: SlashCommandChannelOption) => channel
			.setName("thread")
			.setDescription("Ветка, которая не должна быть архивирована.")
			.setRequired(false)
			.addChannelTypes(ChannelType.PublicThread, ChannelType.PrivateThread, ChannelType.AnnouncementThread)
		)
	))
	logger.Verbose(app.bot.uploadContextMenuCommand("main", (contextMenuCommand: ContextMenuCommandBuilder) => contextMenuCommand
		.setType(ApplicationCommandType.Message)
		.setName("Thread")
		.setDefaultMemberPermissions(PermissionFlagsBits.CreatePublicThreads)
	))

	return [
		new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
			if (!interaction.isChatInputCommand() || interaction.commandName != "alwaysactive") return
			await interaction.deferReply({ ephemeral: true })
			try {
				let channel = (interaction.options.getChannel("thread", false) || await (app.bot.channels.fetch(interaction.channelId))) as GuildChannel
				if (!channel) return await interaction.editReply({ embeds: [ErrorEmbed("Канал не найден")] })
				if (!channel.isThread()) return await interaction.editReply({ embeds: [ErrorEmbed("Указанный канал не является веткой.")] })
				let data = await app.prisma.keepUpThread.findUnique({ where: { discord: channel.id } })
				if (data) await app.prisma.keepUpThread.delete({ where: { discord: data.discord } })
				else await app.prisma.keepUpThread.create({ data: { discord: channel.id } })
				await interaction.editReply({ embeds: [SuccesfulEmbed(`Ветка **${data ? "удалена** из" : "добавлена** в"} регистр${data ? "а" : ""}.`)] })
			} catch (err) {
				logger.Error(err)
				interaction.replied ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : await interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
			}
		}),
		new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
			if (!interaction.isContextMenuCommand() || interaction.commandName != "Thread" || interaction.commandType != ApplicationCommandType.Message) return
			try {
				await interaction.deferReply({ ephemeral: true })
				let msg = interaction.targetMessage
				let channel = msg.channel
				if (channel.isThread() || channel.isDMBased() || channel.isVoiceBased())
					return await interaction.editReply({ embeds: [ErrorEmbed("Команда должна быть вызвана в текстовом канале (но не в ветке)")] })
				let thread = await channel.threads.create({
					name: `Ветка N${(await channel.threads.fetch()).threads.size + 1}`,
					reason: `Initiated by User input (${interaction.user.tag})`,
					startMessage: msg
				})
				await interaction.editReply({embeds: [SuccesfulEmbed(`Ветка создана (<#${thread.id}>)`)]})
			} catch (err) {
				logger.Error(err)
				interaction.replied ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : await interaction.reply({ ephemeral: true, embeds: [ErrorEmbed()] })
			}
		}),
		new DiscordEvent("threadUpdate", async (oldThread: ThreadChannel, newThread: ThreadChannel) => {
			let data = await app.prisma.keepUpThread.findUnique({ where: { discord: newThread.id } })
			logger.Debug("Data: ", data, newThread)
			if (oldThread.archived == false && newThread.archived == true && data && newThread.unarchivable) {
				await newThread.setArchived(false)
			}
		})
	]
})
