import { ModalBuilder, SlashCommandBuilder, SlashCommandUserOption } from "@discordjs/builders";
import { channel } from "diagnostics_channel";
import { Message as DMsg, Interaction, ActionRowBuilder, ButtonBuilder, EmbedBuilder, TextChannel, ThreadChannel, ButtonStyle, APIActionRowComponent, APIButtonComponent, TextInputBuilder, MessageManager, TextInputStyle, Collection } from "discord.js";
import { setDefaultResultOrder } from "dns";
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
		logger.Verbose(app.bot.uploadCommand("main", (slashCommand: SlashCommandBuilder) =>
			slashCommand
				.setName("join")
				.setDescription("Написать заявку для присоединения к серверу.")
		))
		logger.Verbose(app.bot.uploadCommand("main", (slashCommand: SlashCommandBuilder) =>
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
		let ButtonActionRow_1 = (reqID: string, disabled = false, success = false) =>
			new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId(`join:admin:accept:${reqID}`)
						.setLabel('Принять')
						.setStyle(success ? ButtonStyle.Success : ButtonStyle.Danger)
						.setDisabled(disabled),
					new ButtonBuilder()
						.setCustomId(`join:admin:reject:${reqID}`)
						.setLabel('Отклонить')
						.setStyle(ButtonStyle.Danger)
						.setDisabled(disabled),
					new ButtonBuilder()
						.setCustomId(`join:admin:check:${reqID}`)
						.setLabel('Проверить')
						.setStyle(ButtonStyle.Secondary)
						.setDisabled(disabled)
				)
				.toJSON() as APIActionRowComponent<APIButtonComponent>

		let ButtonActionRow_2 = (reqID: string, disabled = false, success = false) =>
			new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId(`join:user:confirm:${reqID}`)
						.setLabel('Подтвердить')
						.setStyle(ButtonStyle.Danger),
					new ButtonBuilder()
						.setCustomId(`join:user:biography:${reqID}`)
						.setLabel('Биография')
						.setStyle(ButtonStyle.Primary)
				)
				.toJSON() as APIActionRowComponent<APIButtonComponent>

		let reqUUID = v4()

		let ModalActionRow_1 = new ModalBuilder()
			.setCustomId(`join:modal_1`)
			.setTitle('заявка на присоединение')
			.addComponents(
				new ActionRowBuilder<TextInputBuilder>()
					.addComponents(
						new TextInputBuilder()
							.setCustomId(`join:question_1`)
							.setLabel('Ваш ник в Майнкрафт?')
							.setPlaceholder('обязательно')
							.setMaxLength(30)
							.setStyle(TextInputStyle.Short)
					),
				new ActionRowBuilder<TextInputBuilder>()
					.addComponents(
						new TextInputBuilder()
							.setCustomId(`join:question_2`)
							.setLabel('Ваш возраст?')
							.setPlaceholder('обязательно')
							.setMaxLength(3)
							.setStyle(TextInputStyle.Short)
					),
				new ActionRowBuilder<TextInputBuilder>()
					.addComponents(
						new TextInputBuilder()
							.setCustomId(`join:question_3`)
							.setLabel('Ваш пол?')
							.setPlaceholder('не обязательно')
							.setMaxLength(15)
							.setStyle(TextInputStyle.Short)
							.setRequired(false)
					),
				new ActionRowBuilder<TextInputBuilder>()
					.addComponents(
						new TextInputBuilder()
							.setCustomId(`join:question_4`)
							.setLabel('Ваш клиент (Java, Bedrock, Оба)?')
							.setPlaceholder('обязательно')
							.setMaxLength(15)
							.setStyle(TextInputStyle.Short)
					),
				new ActionRowBuilder<TextInputBuilder>()
					.addComponents(
						new TextInputBuilder()
							.setCustomId(`join:question_5`)
							.setLabel('Кто вас пригласил / ваш промокод?')
							.setPlaceholder('не обязательно')
							.setMaxLength(30)
							.setStyle(TextInputStyle.Short)
							.setRequired(false)
					)
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
					await interaction.showModal(ModalActionRow_1);
				} catch (err) {
					logger.Error(err)
					interaction.replied ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : await interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
				}
			}),
			new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
				if (!interaction.isModalSubmit()) return
				if (!interaction.customId.startsWith('join:')) return
				try {
					if (await app.prisma.user.findFirst({ where: { discord: interaction.id } }) != null) return interaction.editReply({ embeds: [ErrorEmbed(`Вы уже игрок. (How Did We Get Here?)`)] })

					const QPostfixes = ['_1', '_2', '_3', '_4', '_5']
					const QTextInput = QPostfixes.map(x => {
						return interaction.fields.getTextInputValue(`join:question${x}`)
					}).filter(x => typeof x === `string`)

					let Text_1 = 'Не указан', Text_2 = 'Не указан'
					if (QTextInput[2]) { Text_1 = QTextInput[2] }
					if (QTextInput[4]) { Text_2 = QTextInput[4] }

					let request = await app.prisma.request.create({
						data: {
							message: '',
							fields: JSON.stringify(QTextInput),
							locked: false,
							discord: interaction.user.id
						}
					})

					// let data = interaction.customId.split(':')
					// let action = data[2]
					// let reqID = data[3]
					// let req = await app.prisma.request.findFirst({ where: { id: reqID } })
					// if (req == null) return await interaction.editReply({ embeds: [ErrorEmbed("Заявка не найдена (How did we get here?)")] })
					// if (req.locked == true) return await interaction.editReply({ embeds: [ErrorEmbed("К заявке применено другое действие.")] })
					// await app.prisma.request.update({ where: { id: req.id }, data: { locked: true } })

					if (interaction.customId == `join:modal_1`) {
						interaction.reply({
							embeds: [
								new EmbedBuilder()
									.setTitle('Ваша заявка на присоединение')
									.addFields(
										{ name: 'Ник в Майнкрафт', value: `${QTextInput[0]}`, inline: true },
										{ name: 'Пол', value: `${Text_1}`, inline: true },
										{ name: 'Возраст', value: `${QTextInput[1]}`, inline: true },
										{ name: 'Пригласил / Промокод', value: `${Text_2}`, inline: true },
										{ name: 'Клиент', value: `${QTextInput[3]}`, inline: true }
									)
									.setColor('#3ba55d')
									.setFooter(footer)
									.setTimestamp(Date.now())
							],
							components: [ButtonActionRow_2(request.id)],
							ephemeral: true
						})
					}

					const collector = interaction.channel?.createMessageComponentCollector({
						//filter: int => interaction.customId == request.id
					});

					collector?.on(`collect`, async (int) => {
						logger.Debug("COLLECTOR INT", int)
						if (int.customId.startsWith("join:user:confirm:")) {
						// if (action == `confirm`) {
							// await int.reply({ content: 'Заявка отправлена на модерацию', ephemeral: true }),

							await int.channel?.send({
								embeds: [
									new EmbedBuilder()
										.setTitle(`Заявка: ${interaction.user.username}`)
										.setURL(`https://discordapp.com/users/${interaction.user.id}/`)
										.addFields(
											{ name: 'Ник в Майнкрафт', value: `${QTextInput[0]}`, inline: true },
											{ name: 'Пол', value: `${Text_1}`, inline: true },
											{ name: 'Возраст', value: `${QTextInput[1]}`, inline: true },
											{ name: 'Пригласил / Промокод', value: `${Text_2}`, inline: true },
											{ name: 'Клиент', value: `${QTextInput[3]}`, inline: true }
										)
										.setColor('#3ba55d')
										.setFooter(footer)
										.setTimestamp(Date.now())
								],
								components: [ButtonActionRow_1(request.id)]
							})
						}
					})
				} catch (err) {
					logger.Error(err)
					interaction.replied || interaction.deferred ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
				}
			}),
			new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
				if (!interaction.isButton()) return
				if (!interaction.customId.startsWith('join:admin:')) return
				try {
					await interaction.deferReply()
					let data = interaction.customId.split(':')
					let action = data[2]
					let reqID = data[3]
					let req = await app.prisma.request.findFirst({ where: { id: reqID } })
					if (req == null) return await interaction.editReply({ embeds: [ErrorEmbed("Заявка не найдена (How did we get here?)")] })
					if (req.locked == true) return await interaction.editReply({ embeds: [ErrorEmbed("К заявке применено другое действие.")] })
					await app.prisma.request.update({ where: { id: req.id }, data: { locked: true } })
					let reqData = JSON.parse(req.fields)

					if (action == "accept") {
						let user = await app.prisma.user.create({
							data: {
								nickname: reqData[1],
								age: parseInt(reqData[2]),
								discord: req.discord,
								requestId: req.id,
								country: undefined,
							}
						})
						await app.prisma.subscription.create({
							data: {
								userId: user.id,
								started: new Date(),
								ends: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
								status: "active",
								plan: user.nextPlan,
							}
						})
						await (interaction.message as DMsg).edit({ components: [ButtonActionRow_1(req.id, true, true)] })
						await interaction.editReply({ embeds: [SuccesfulEmbed(`Заявка от игрока <@${req.discord}> принята <@${interaction.user.id}>`)] })
						//await (app.bot.channels.cache.get(interaction.channelId) as ThreadChannel).setAutoArchiveDuration(60)
						return await app.prisma.request.update({ where: { id: req.id }, data: { locked: false } })
					}
					else if (action == "reject") {
						await app.prisma.request.delete({ where: { id: req.id } })
						let messages: Collection<string, DMsg<true>> | null = (await interaction.channel?.messages.fetch({ limit: 10 })) as Collection<string, DMsg<true>>
						let message: DMsg<true> | null = null
						if (messages != null)
							message = messages.filter((msg: DMsg<true>) => msg.author.id == interaction.user.id).first() || null
						await (interaction.message as DMsg).edit({ components: [ButtonActionRow_1(req.id, true)] })
						await interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setTimestamp(Date.now())
									.setTitle("Заявка отклонена.")
									.setFooter(footer)
									.setDescription(`Заявка от <@${req.discord}> отклонена <@${interaction.user.id}> ${message ? `по причине ${message.content}` : ''}.`)
							]
						})
						//await (app.bot.channels.cache.get(interaction.channelId) as ThreadChannel).setAutoArchiveDuration(60)
					}
					else if (action == "check") {
						interaction.editReply({ embeds: [ProcessingEmbed(`Начата проверка...`)] })
						let reqs = (await app.prisma.request.findMany()).filter((r) => r.id != req?.id)
						let reqFields = JSON.parse(req.fields) as string[]
						reqFields = [reqFields[1], reqFields[4], reqFields[5], reqFields[6]]
						let interseActions: [{ id: string, fields: string[] }?] = []
						reqs.forEach(r => {
							let filtered = reqFields.filter(f => JSON.parse(r.fields).includes(f) && f != '-')
							if (filtered.length)
								interseActions.push({ id: r.id, fields: filtered })
						})
						if (interseActions.length) {
							await interaction.editReply({
								embeds: [
									new EmbedBuilder()
										.setTimestamp(Date.now())
										.setFooter(footer)
										.setTitle("Обнаружено совпадение!")
										.addFields(interseActions.map(e => ({ name: `Из заявки https://discord.com/channels/${app.config.bot.guildId}/${((app.bot.channels.cache.get(interaction.channelId) as ThreadChannel).parent as TextChannel).id}/${reqs.filter(r => r.id == e?.id)[0].message}`, value: `Совпадают ответы: "${e?.fields.join(", ")}".`, inline: true })))
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
					if (!interaction.memberPermissions?.has("ManageGuild")) return await interaction.editReply({ embeds: [ErrorEmbed("Недостаточно полномочий.")] })
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
			}),
			new DiscordEvent("ready", async () => {
				try {
					await app.prisma.request.updateMany({ where: { locked: true }, data: { locked: false } })
				} catch (err) {
					logger.Error(err)
				}
			})
		]
	}
)
