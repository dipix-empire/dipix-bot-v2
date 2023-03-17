import { Interaction, Collection, TextChannel, EmbedBuilder, ThreadChannel, Message as DMsg, BitField, PermissionFlagsBits, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle, ThreadAutoArchiveDuration, ChannelType, APIActionRowComponent, APIButtonComponent } from "discord.js";
import App from "../../../../App";
import { ErrorEmbed, SuccesfulEmbed, footer, ProcessingEmbed } from "../../../../Data/Embeds";
import Logger from "../../../../types/Logger";
import DiscordEvent from "../../../../types/ModuleEvent/DiscordEvent";
import { ButtonActionRowAdmin, DiscussActionRow } from "../Buttons";
import { connectButton } from "../../../Common/Connect";

export default (app: App, logger: Logger) => new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
	if (!interaction.isButton()) return
	if (!interaction.customId.startsWith('join:admin:')) return
	try {
		await interaction.deferReply()
		if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) return interaction.editReply({ embeds: [ErrorEmbed("Missing permissions.")] })
		let data = interaction.customId.split(':')
		let action = data[2]
		let reqID = data[3]
		let req = await app.prisma.request.findFirst({ where: { id: reqID } })
		if (req == null) return await interaction.editReply({ embeds: [ErrorEmbed("Заявка не найдена (How did we get here?)")] })
		if (req.locked == true) return await interaction.editReply({ embeds: [ErrorEmbed("Заявка заблокирована (Выполняется другое действие или открыто обсуждение)")] })
		await app.prisma.request.update({ where: { id: req.id }, data: { locked: true } })
		let reqData = JSON.parse(req.fields)

		if (action == "accept") {
			let user = await app.prisma.user.create({
				data: {
					nickname: reqData[0],
					age: parseInt(reqData[1]),
					discord: req.discord,
					requestId: req.id,
					client: "both",
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
			let discordUser = await app.bot.users.fetch(user.discord)
			await (await discordUser.createDM()).send({
				embeds: [new EmbedBuilder()
					.setTitle("Ваша заявка принята!")
					.setDescription("Теперь вы можете играть на сервере!\nДля получения IP нажмите кнопку ниже или воспользуйтесь `/connect` на дискорд-сервере.\n**Не показывайте IP никому, пожалуйста**")
					.setColor(Colors.Green)
					.setFooter(footer)
					.setTimestamp(Date.now())
				],
				components: [connectButton]
			})
			return await app.prisma.request.update({ where: { id: req.id }, data: { locked: false } })
		}
		else if (action == "reject") {
			await app.prisma.request.delete({ where: { id: req.id } })
			let messages: Collection<string, DMsg<true>> | null = (await (interaction.channel as TextChannel)?.messages.fetch({ limit: 10 })) as Collection<string, DMsg<true>>
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
			let user = await app.bot.users.fetch(req.discord)
			await (await user.createDM()).send({
				embeds: [new EmbedBuilder()
					.setColor(Colors.Red)
					.setDescription(`Администраторы рассмотрели заявку и приняли решение её отклонить.${message ? `по причине ${message.content}` : ''}`)
					.setTitle("Ваша заявка отклонена!")
					.setTimestamp(Date.now())
					.setFooter(footer)
				]
			})
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
		else if (action == "discuss") {
			let channel = await app.bot.channels.fetch(app.config.modules.join.channels.discuss)
			if (!channel) return interaction.editReply({ embeds: [ErrorEmbed("Не найден канал дискуссий.")] })
			if (!channel.isTextBased() || !(channel instanceof TextChannel)) return interaction.editReply({ embeds: [ErrorEmbed(`Тип канала дисскусий некорректен (<#${app.config.modules.join.channels.discuss}>`)] })
			let embed = new EmbedBuilder()
				.setTitle("Детали заявки.")
				.addFields(
					{ name: "Пользователь", value: `<@${req.discord}>`, inline: true },
					{ name: 'Ник в Майнкрафт', value: `${reqData[0]}`, inline: true },
					{ name: 'Пол', value: `${reqData[2] || "Не указан"}`, inline: true },
					{ name: 'Возраст', value: `${reqData[1]}`, inline: true },
					{ name: 'Пригласил / Промокод', value: `${reqData[5]}`, inline: true },
					{ name: 'Клиент', value: `${reqData[3]}`, inline: true }
				)
				.setTimestamp(Date.now())
				.setFooter(footer)
				.setColor("#3ba55d")
			let discordUser = await app.bot.users.fetch(req.discord)
			let thread = await channel.threads.create({
				name: `Обсуждение заявки от ${discordUser.tag}`,
				autoArchiveDuration: ThreadAutoArchiveDuration.ThreeDays,
				type: ChannelType.PrivateThread,
				invitable: false
			})
			let msg = await thread.send({ embeds: [embed], components: [DiscussActionRow(req.id, false, `https://discord.com/channels/${app.config.bot.guildId}/${app.config.modules.join.channels.panel}/${req.message}`)] })
			await (await discordUser.createDM()).send({
				embeds: [new EmbedBuilder()
					.setColor(Colors.Yellow)
					.setDescription(`Администраторы хотят обсудить вашу заявку.`)
					.setTitle("По заявке открыто обсуждение.")
					.setTimestamp(Date.now())
					.setFooter(footer)
				], components: [new ActionRowBuilder()
					.addComponents(new ButtonBuilder()
						.setStyle(ButtonStyle.Link)
						.setURL(`https://discord.com/channels/${app.config.bot.guildId}/${thread.id}/${msg.id}`)
						.setLabel("Открыть обсуждение")
					)
					.toJSON() as APIActionRowComponent<APIButtonComponent>
				]
			})
			await interaction.editReply({
				embeds: [SuccesfulEmbed("Обсуждение заявки открыто!")],
				components: [new ActionRowBuilder()
					.addComponents(new ButtonBuilder()
						.setStyle(ButtonStyle.Link)
						.setURL(`https://discord.com/channels/${app.config.bot.guildId}/${thread.id}/${msg.id}`)
						.setLabel("Открыть обсуждение")
					)
					.toJSON() as APIActionRowComponent<APIButtonComponent>
				]
			})
			await (await thread.send(`<@${req.discord}>, <@${interaction.user.id}>`)).delete()
		}
	} catch (err) {
		logger.Error(err)
		interaction.replied || interaction.deferred ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
	}
})
