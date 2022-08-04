import { SlashCommandBuilder, SlashCommandUserOption } from "@discordjs/builders";
import { UserStatus } from "@prisma/client";
import { Message as DMsg, Interaction, MessageActionRow, MessageButton, MessageEmbed, TextChannel, ThreadChannel } from "discord.js";
import { EventEmitter } from "stream";
import { v4 } from "uuid";
import App from "../../App";
import { ErrorEmbed, footer, ProcessingEmbed, SuccesfulEmbed } from "../../Data/Embeds";
import Message from "../../types/AppBus/Message";
import AppBusModuleComponent from "../../types/AppBus/ModuleComponent";
import Conversation from "../../types/Conversation";
import Logger from "../../types/Logger";
import Module from "../../types/Module";
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent";

export default new Module(
	"join",
	async (app: App, appBusModule: AppBusModuleComponent, logger: Logger) => {
		logger.Verbose(app.bot.uploadCommand(app.config.bot.guildId,(slashCommand: SlashCommandBuilder) =>
			slashCommand
				.setName("join")
				.setDescription("Написать заявку для присоединения к серверу.")
		))
		logger.Verbose(app.bot.uploadCommand(app.config.bot.guildId, (slashCommand: SlashCommandBuilder) =>
			slashCommand
				.setName("autoaccept")
				.setDescription("Автоматически принять заявку игрока.")
				.addUserOption((option: SlashCommandUserOption) =>
					option
						.setName('user')
						.setDescription('Юзер')
						.setRequired(true)
				)
		))
		let actionRow = (reqID: string, disabled = false, success = false) =>
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
					if (await app.prisma.user.findFirst({ where: { discord: interaction.id } }) != null) return interaction.editReply({ embeds: [ErrorEmbed(`Вы уже игрок. (How Did We Get Here?)`)] })
					let reqUUID = v4()
					let handler = async (msg: Message) => {
						logger.Debug(`HANDLING MESSAGE (conversation code: ${msg.data.code})`)
						switch (msg.data.code) {
							case 0:
								let request = await app.prisma.request.create({
									data: {
										message: "",
										fields: JSON.stringify([...(msg.data.conversation as Conversation).questions.map((q, k) => (msg.data.conversation.answers[k]))]),
										locked: false,
										discord: interaction.user.id
									}
								})
								let answer = await interaction.editReply(`Заявка на присоединение от игрока <@${interaction.user.id}>`) as DMsg
								(await (await (answer.channel as TextChannel).threads.create({
									name: `Заявка от ${interaction.user.tag}`,
									startMessage: answer,
									autoArchiveDuration: 1440
								})).send({
									embeds: [
										new MessageEmbed()
											.setTitle("Заявка на присоединение.")
											.setDescription(`Заявку принимает <@&${app.config.bot.roles.administration}>`)
											.addFields((msg.data.conversation as Conversation).questions.map((q, k) => ({ name: q.question, value: msg.data.conversation.answers[k], inline: true })))
											.setColor('#3ba55d')
											.setFooter(footer)
											.setTimestamp(Date.now())
									],
									components: [
										actionRow(request.id)
									]
								})).pin()
								await app.prisma.request.update({ where: { id: request.id }, data: { message: answer.id } })
								await (app.bot.channels.cache.get(app.config.bot.channels.manageChannel) as TextChannel)
									.send(`<${app.config.bot.roles.administration}>, поступила новая заявка:\nhttps://discord.com/channels/${app.config.bot.guildId}/${interaction.channelId}/${answer.id}`)
								break
							case 1:
								await interaction.editReply({ embeds: [ErrorEmbed()] })
								break
							case 2:
								await interaction.editReply({ embeds: [ErrorEmbed("Вы уже заполняете форму.")] })
								break
						}
						events.removeListener(reqUUID, handler)
					}
					events.on(reqUUID, handler)
					appBusModule.send('conversation', { type: 'join', user: interaction.user, id: reqUUID })
				} catch (err) {
					logger.Error(err)
					interaction.replied ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : await interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
				}
			}),
			new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
				if (!interaction.isButton()) return
				if (!interaction.customId.startsWith('join:')) return
				try {
					await interaction.deferReply()
					let data = interaction.customId.split(':')
					let action = data[1]
					let reqID = data[2]
					let req = await app.prisma.request.findFirst({ where: { id: reqID } })
					if (req == null) return await interaction.editReply({ embeds: [ErrorEmbed("Заявка не найдена (How did we get here?)")] })
					if (req.locked == true) return await interaction.editReply({ embeds: [ErrorEmbed("К заявке применено другое действие.")] })
					await app.prisma.request.update({ where: { id: req.id }, data: { locked: true } })
					let reqData = JSON.parse(req.fields)
					if (action == "accept") {
						await app.prisma.user.create({
							data: {
								nickname: reqData[1],
								age: parseInt(reqData[2]),
								discord: req.discord,
								status: UserStatus.waitingForPays,
								requestId: req.id,
								promo: reqData[6]
							}
						})
						await (interaction.message as DMsg).edit({ components: [actionRow(req.id, true, true)] })
						await interaction.editReply({ embeds: [SuccesfulEmbed(`Заявка от игрока <@${req.discord}> принята <@${interaction.user.id}>`)] })
						await (app.bot.channels.cache.get(interaction.channelId) as ThreadChannel).setAutoArchiveDuration(60)
						return await app.prisma.request.update({ where: { id: req.id }, data: { locked: false } })
					}
					else if (action == "reject") {
						await app.prisma.request.delete({ where: { id: req.id } })
						let message = (await interaction.channel?.messages.fetch({ limit: 10 }))?.filter(msg => msg.author.id == interaction.user.id).first()
						await (interaction.message as DMsg).edit({ components: [actionRow(req.id, true)] })
						await interaction.editReply({
							embeds: [
								new MessageEmbed()
									.setTimestamp(Date.now())
									.setTitle("Заявка отклонена.")
									.setFooter(footer)
									.setDescription(`Заявка от <@${req.discord}> отклонена <@${interaction.user.id}> ${message ? `по причине ${message.content}` : ''}.`)
							]
						})
						await (app.bot.channels.cache.get(interaction.channelId) as ThreadChannel).setAutoArchiveDuration(60)
					}
					else if (action == "check") {
						interaction.editReply({ embeds: [ProcessingEmbed(`Начата проверка...`)] })
						let reqs = (await app.prisma.request.findMany()).filter((r) => r.id != req?.id)
						let reqFields = JSON.parse(req.fields) as string[]
						reqFields = [reqFields[1], reqFields[4], reqFields[5], reqFields[6]]
						let intersections: [{ id: string, fields: string[] }?] = []
						reqs.forEach(r => {
							let filtered = reqFields.filter(f => JSON.parse(r.fields).includes(f) && f != '-')
							if (filtered.length)
								intersections.push({ id: r.id, fields: filtered })
						})
						if (intersections.length) {
							await interaction.editReply({
								embeds: [
									new MessageEmbed()
										.setTimestamp(Date.now())
										.setFooter(footer)
										.setTitle("Обнаружено совпадение!")
										.addFields(intersections.map(e => ({ name: `Из заявки https://discord.com/channels/${app.config.bot.guildId}/${((app.bot.channels.cache.get(interaction.channelId) as ThreadChannel).parent as TextChannel).id}/${reqs.filter(r => r.id == e?.id)[0].message}`, value: `Совпадают ответы: "${e?.fields.join(", ")}".`, inline: true })))
								]
							})
						}
						else await interaction.editReply({ embeds: [SuccesfulEmbed("Совпадений не найдено.")] })
						return await app.prisma.request.update({ where: { id: reqID }, data: { locked: false } })
					}
				} catch (err) {
					logger.Error(err)
					interaction.replied || interaction.deferred ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
				}
			}),
			new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
				if (!interaction.isCommand() || interaction.commandName != "autoaccept") return
				try {
					await interaction.deferReply({ ephemeral: true })
					if (!interaction.memberPermissions?.has("MANAGE_GUILD")) return await interaction.editReply({ embeds: [ErrorEmbed("Недостаточно полномочий.")] })
					let user = interaction.options.getUser('user', true)
					if (await app.prisma.user.findFirst({ where: { discord: user.id } }))
						return await interaction.editReply({ embeds: [ErrorEmbed(`Пользователь <@${user.id}> уже является игроком.`)] })
					if (await app.prisma.request.findFirst({ where: { discord: user.id } }))
						return await interaction.editReply({ embeds: [ErrorEmbed(`Пользователь <@${user.id}> уже написал заявку, вы можете просто принять её.`)] })
					let accepted = await app.prisma.autos.findFirst({ where: { discord: user.id } })
					if (accepted)
						return await interaction.editReply({ embeds: [ErrorEmbed(`<@${accepted.whoAccepted}> уже добавил <@${user.id}> в список автоматически принятых посетителей.`)] })
					await app.prisma.autos.create({ data: { discord: user.id, whoAccepted: interaction.user.id } })
					await interaction.editReply({ embeds: [SuccesfulEmbed(`Пользователь <@${user.id}> добавлен в список автоматически принимаемых посетителей.`)] })
				} catch (err) {
					logger.Error(err)
					interaction.replied ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : await interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
				}
			})
		]
	}
)