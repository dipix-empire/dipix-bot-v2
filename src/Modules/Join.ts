import { SlashCommandBuilder } from "@discordjs/builders";
import { UserStatus } from "@prisma/client";
import { Message as DMsg, Interaction, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from "discord.js";
import { EventEmitter } from "stream";
import { v4 } from "uuid";
import App from "../App";
import { ErrorEmbed, SuccesfulEmbed } from "../Data/Embeds";
import Message from "../types/AppBus/Message";
import AppBusModuleComponent from "../types/AppBus/ModuleComponent";
import Conversation from "../types/Conversation";
import Logger from "../types/Logger";
import Module from "../types/Module";
import DiscordEvent from "../types/ModuleEvent/DiscordEvent";

export default new Module(
	"join",
	async (app: App, appBusModule: AppBusModuleComponent, logger: Logger) => {
		logger.Verbose(app.bot.uploadCommand((slashCommand: SlashCommandBuilder) => 
				slashCommand
					.setName("join")
					.setDescription("Написать заявку для присоединения к серверу.")
		))
		let actionRow = (reqID: string, disabled = false, success=false) => 
		new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId(`join:accept:${reqID}`)
					.setLabel('Принять')
					.setStyle(success ? 'SUCCESS' : 'PRIMARY')
					.setDisabled(disabled),
				new MessageButton()
					.setCustomId(`join:reject:${reqID}`)
					.setLabel('Отклонить')
					.setStyle('DANGER')
					.setDisabled(disabled),
				new MessageButton()
					.setCustomId(`join:check:${reqID}`)
					.setLabel('Проверить')
					.setStyle("SECONDARY")
					.setDisabled(disabled)
			)
		let events = new EventEmitter()
		appBusModule.onMessage((msg: Message) => {
			if (msg.sender == "conversation") {
				events.emit(msg.data.id, msg) 
			}
		})
		return [
			new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
				if (!interaction.isCommand() || interaction.commandName != "join") return
				try {
					await interaction.deferReply()
					// if (await app.prisma.user.findFirst({where: {discord: interaction.id}}) != null)
					let reqUUID = v4()
					let handler = async (msg: Message) => {
						logger.Debug(`HANDLING MESSAGE (conversation code: ${msg.data.code})`)
						switch (msg.data.code) {
							case 0:
								let request = await app.prisma.request.create({
									data: {
										message: "",
										fields: JSON.stringify([...(msg.data.conversation as Conversation).questions.map((q, k) => (msg.data.conversation.answers[k])), `${interaction.user.id}`])
									}
								})
								let answer = await interaction.editReply({
									embeds: [
										new MessageEmbed()
											.setTitle("Заявка на присоединение.")
											.setDescription(`Заявку принимает <@&${app.config.bot.roles.administration}>`)
											.addFields((msg.data.conversation as Conversation).questions.map((q, k) => ({name: q.question, value:msg.data.conversation.answers[k], inline:true})))
											.setColor('#3ba55d')
									],
									components: [
										actionRow(request.id)	
									]
								})
								await (app.bot.channels.cache.get(app.config.bot.channels.manageChannel) as TextChannel)
								.send(`<${app.config.bot.roles.administration}>, поступила новая заявка:\nhttps://discord.com/channels/${app.config.bot.guildId}/${interaction.channelId}/${answer.id}`)
								break
							case 1:
								interaction.editReply({embeds: [ErrorEmbed()]})
								break
							case 2:
								interaction.editReply({embeds: [ErrorEmbed("Вы уже заполняете форму.")]})
								break
						}
						events.removeListener(reqUUID, handler)
					}
					events.on(reqUUID, handler)
					appBusModule.send('conversation', {type: 'join', user: interaction.user, id: reqUUID})
				} catch (err) {
					logger.Error(err)
					interaction.replied ? interaction.editReply({embeds: [ErrorEmbed()]}) : interaction.reply({embeds: [ErrorEmbed()], ephemeral: true})
				}
			}),
			new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
				if (!interaction.isButton()) return
				if (!interaction.customId.startsWith('join:')) return
				await interaction.deferReply()
				try {
					let data = interaction.customId.split(':')
					let action = data[1]
					let reqID = data[2]
					let req = await app.prisma.request.findFirst({where:{id: reqID}})
					if (req == null) return interaction.editReply({embeds:[ErrorEmbed()]})
					let reqData = JSON.parse(req.fields)
					logger.Debug("req data:")
					if (action == "accept") {
						await app.prisma.user.create({
							data: {
								nickname: reqData[1],
								age: parseInt(reqData[2]),
								discord: reqData[8],
								status: UserStatus.waitingForPays,
								requestId: req.id,
								promo: reqData[6]
							}
						})
						await (interaction.message as DMsg).edit({components: [actionRow(req.id, true)]})
						return interaction.editReply({embeds:[SuccesfulEmbed(`Заявка от игрока <@${reqData[8]}> принята <@${interaction.user.id}>`)]})
					}
				} catch(err) {
					logger.Error(err)
					interaction.editReply({embeds:[ErrorEmbed()]})
				}
			})
		]
	}
)