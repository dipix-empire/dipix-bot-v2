import { ModalBuilder, SlashCommandBuilder, SlashCommandUserOption } from "@discordjs/builders";
import { Message as DMsg, Interaction, ActionRowBuilder, ButtonBuilder, ButtonInteraction, EmbedBuilder, TextChannel, ThreadChannel, ButtonStyle, APIActionRowComponent, APIButtonComponent, TextInputBuilder, TextInputStyle, Collection, ModalSubmitInteraction } from "discord.js";
import { EventEmitter } from "stream";
import App from "../../App";
import { ErrorEmbed, footer, ProcessingEmbed, SuccesfulEmbed } from "../../Data/Embeds";
import Message from "../../types/AppBus/Message";
import AppBusModuleComponent from "../../types/AppBus/ModuleComponent";
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
		const Embed = (Text_1: string, Text_2: string, TextInput: string[]) => new EmbedBuilder()
			.addFields(
				{ name: 'Ник в Майнкрафт', value: `${TextInput[0]}`, inline: true },
				{ name: 'Пол', value: `${Text_1}`, inline: true },
				{ name: 'Возраст', value: `${TextInput[1]}`, inline: true },
				{ name: 'Пригласил / Промокод', value: `${Text_2}`, inline: true },
				{ name: 'Клиент', value: `${TextInput[3]}`, inline: true }
			)
			.setColor('#3ba55d')
			.setFooter(footer)
			.setTimestamp(Date.now())
		let ButtonActionRowAdmin = (reqID: string, disabled = false, success = false) =>
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
		let ButtonActionRowUser = (reqID: string, disabledSend = true, disabledAll = false) =>
			new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId(`join:user:send:${reqID}`)
						.setLabel('Отправить')
						.setStyle(ButtonStyle.Danger)
						.setDisabled(disabledAll || disabledSend),
					new ButtonBuilder()
						.setCustomId(`join:user:rules:${reqID}`)
						.setLabel('Правила')
						.setStyle(ButtonStyle.Danger)
						.setDisabled(disabledAll),
					new ButtonBuilder()
						.setCustomId(`join:user:biography:${reqID}`)
						.setLabel('Биография')
						.setStyle(ButtonStyle.Secondary)
						.setDisabled(disabledAll)
				)
				.toJSON() as APIActionRowComponent<APIButtonComponent>
		let ModalActionRowQuestion = new ModalBuilder()
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
							.setMaxLength(2)
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
							.setStyle(TextInputStyle.Short),
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
		let ModalActionRowBiography = (reqID: string) => new ModalBuilder()
			.setCustomId(`join:bio_modal:${reqID}`)
			.setTitle('редактирование')
			.addComponents(
				new ActionRowBuilder<TextInputBuilder>()
					.addComponents(
						new TextInputBuilder()
							.setCustomId(`join:biography`)
							.setLabel('Биография')
							.setPlaceholder('Биография вашего персонажа для РП')
							.setMaxLength(2000)
							.setStyle(TextInputStyle.Paragraph)
					)
			)
		let events = new EventEmitter()
		appBusModule.onMessage((msg: Message) => {
			if (msg.sender == "conversation") {
				events.emit(msg.data.id, msg)
			}
		})
		let userBuffer: {[key: string]: Interaction} = {} 
		return [
			// Команда
			new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
				if (!interaction.isCommand() || interaction.commandName != "join") return
				try {
					if (await app.prisma.user.findFirst({ where: { discord: interaction.user.id } }) != null) return interaction.reply({ embeds: [ErrorEmbed('❌ Вы уже игрок. (How Did We Get Here?)')], ephemeral: true })
					else { await interaction.showModal(ModalActionRowQuestion); }
				} catch (err) {
					logger.Error(err)
					interaction.replied ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : await interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
				}
			}),
			// Модалка основная инфа
			new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
				if (!interaction.isModalSubmit()) return
				if (!interaction.customId.startsWith('join:modal_1')) return
				try {
					const Postfixes = ['_1', '_2', '_3', '_4', '_5']
					const TextInput = Postfixes.map(x => {
						return interaction.fields.getTextInputValue(`join:question${x}`)
					}).filter(x => typeof x === `string`)
					// тут можно проще сделать
					// let Text_1 = 'Не указан', Text_2 = 'Не указан'
					// if (TextInput[2]) { Text_1 = TextInput[2] }
					// if (TextInput[4]) { Text_2 = TextInput[4] }
					let Text_1 = TextInput[2] || 'Не указан', Text_2 = TextInput[4] || 'Не указан'

					let request = await app.prisma.request.create({
						data: {
							message: '',
							fields: JSON.stringify(TextInput),
							locked: false,
							discord: interaction.user.id,
						}
					})

					if (interaction.customId == `join:modal_1`) {
						Embed(Text_1, Text_2, TextInput).setTitle('Ваша заявка на присоединение')
						interaction.reply({ embeds: [Embed(Text_1, Text_2, TextInput)], components: [ButtonActionRowUser(request.id)], ephemeral: true })
						userBuffer[`modal:${request.id}`] = interaction
					}
				} catch (err) {
					logger.Error(err)
					interaction.replied || interaction.deferred ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
				}
			}),
			// Кнопки Юзера
			new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
				if (!(interaction instanceof ButtonInteraction)) return
				if (!interaction.customId.startsWith("join:user:")) return
				try {
					let requestId = interaction.customId.split(":").pop()
					let request = await app.prisma.request.findUnique({
						where: { id: requestId }
					})
					if (request == null) throw new Error("Undefined request id")
					let TextInput = JSON.parse(request.fields) as string[]
					let Text_1 = TextInput[2] || 'Не указан', Text_2 = TextInput[4] || 'Не указан'
					if (!userBuffer[`modal:${request.id}`]) return interaction.reply({embeds: [ErrorEmbed("Ошибка буфера данных, перепишите заявку заного.")], ephemeral: true})
					logger.Debug("Interaction ID", interaction.customId)
					if (interaction.customId.startsWith(`join:user:send:`)) {
						await interaction.reply({ content: '✅ Заявка отправлена!', ephemeral: true })
						Embed(Text_1, Text_2, TextInput).setTitle('Ваша заявка на присоединение')
						await (userBuffer[`modal:${request.id}`] as ModalSubmitInteraction).editReply({ embeds: [Embed(Text_1, Text_2, TextInput)], components: [ButtonActionRowUser(request.id, true, true)] })
						Embed(Text_1, Text_2, TextInput).setTitle(`Заявка: ${interaction.user.username}`).setURL(`https://discordapp.com/users/${interaction.user.id}/`)
						await interaction.channel?.send({ embeds: [Embed(Text_1, Text_2, TextInput)], components: [ButtonActionRowAdmin(request.id)] })
					}
					else if (interaction.customId.startsWith(`join:user:rules:`)) {
						// Embed(Text_1, Text_2, TextInput).setTitle('Ваша заявка на присоединение')
						await interaction.reply({
							embeds: [
								new EmbedBuilder()
									.setTitle('Прочтите правила сервера')
									.setURL('https://docs.google.com/document/d/1nldrwFBnT7rf2Pu7jDGGAaIpk6L6nwDd2tja7_c5B2Q/edit')
									.setFooter({ text: 'Отправляя заявку вы принимаете правила сервера' })
							],
							ephemeral: true
						})
						await (userBuffer[`modal:${request.id}`] as ModalSubmitInteraction).editReply({ embeds: [Embed(Text_1, Text_2, TextInput)], components: [ButtonActionRowUser(request.id, false, false)] })
					}
					else if (interaction.customId.startsWith(`join:user:biography:`)) {
						//int.reply({content: `⛔ В разработке!`, ephemeral: true})
						await interaction.showModal(ModalActionRowBiography(request.id));

						// const filter = (int: ModalSubmitInteraction) => int.customId == 'join:modal_2';
						// let submission = await interaction.awaitModalSubmit({ filter, time: 120000 })

						// const biography = submission.fields.getTextInputValue('join:biography');
						// 
						// logger.Debug("", submission.replied)
						// await submission.reply('bebra')

					}
				} catch (err) {
					logger.Error(err)
					interaction.replied ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : await interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
				}
			}),
			// Модалка биография
			new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
				if (!interaction.isModalSubmit()) return
				if (!interaction.customId.startsWith("join:bio_modal:")) return
				try {
					await interaction.deferReply({ephemeral: true})
					let reqID = interaction.customId.split(":").pop() || ""
					let request = await app.prisma.request.findUnique({
						where: {
							id: reqID
						}
					})
					if (!request) throw new Error("No request found")
					const biography = interaction.fields.getTextInputValue('join:biography');

					await app.prisma.request.update({
						where: {
							id: request.id
						},
						data: {
							biography: biography
						}
					})
					interaction.editReply({embeds: [SuccesfulEmbed("Биография добавлена!")]})
				} catch (err) {
					logger.Error(err)
					interaction.replied ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : await interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
				}
			}),
			// Кнопки Админ 
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
								nickname: reqData[0],
								age: parseInt(reqData[1]),
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
						await (interaction.message as DMsg).edit({ components: [ButtonActionRowAdmin(req.id, true, true)] })
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
						await (interaction.message as DMsg).edit({ components: [ButtonActionRowAdmin(req.id, true)] })
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
			// Команда другая
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
			// Разблокировка всех заявок после рестарта бота
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
