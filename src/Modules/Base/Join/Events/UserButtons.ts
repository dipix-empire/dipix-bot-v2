import { Interaction, ButtonInteraction, ModalSubmitInteraction, TextChannel, EmbedBuilder } from "discord.js"
import App from "../../../../App"
import { ErrorEmbed, SuccesfulEmbed } from "../../../../Data/Embeds"
import Logger from "../../../../types/Logger"
import DiscordEvent from "../../../../types/ModuleEvent/DiscordEvent"
import { ButtonActionRowUser, ButtonActionRowAdmin } from "../Buttons"
import { ModalActionRowBiography } from "../Modals"
import Embed from "../Embed"

export default (app: App, logger: Logger, userBuffer: { [key: string]: Interaction }) => new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
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
		if (!userBuffer[`modal:${request.id}`]) return interaction.reply({ embeds: [ErrorEmbed("Ошибка буфера данных, перепишите заявку заново.")], ephemeral: true })
		logger.Debug("Interaction ID", interaction.customId)

		const EmbedTitle = ['Ваша заявка на присоединение', `Заявка: ${interaction.user.username}`]

		if (interaction.customId.startsWith(`join:user:send:`)) {
			await interaction.reply({ embeds: [SuccesfulEmbed("Заявка отправлена!")], ephemeral: true })
			await (userBuffer[`modal:${request.id}`] as ModalSubmitInteraction).editReply({ embeds: [Embed(Text_1, Text_2, TextInput, EmbedTitle[0], interaction)], components: [ButtonActionRowUser(request.id, true, true)] }),
				((app.bot.channels.cache.get(app.config.bot.channels.manageChannel)) as TextChannel).send({ content: `<${app.config.bot.roles.administration}>, поступила новая заявка.`, embeds: [Embed(Text_1, Text_2, TextInput, EmbedTitle[1], interaction)], components: [ButtonActionRowAdmin(request.id)] })
		}
		else if (interaction.customId.startsWith(`join:user:rules:`)) {
			await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle('Прочтите правила сервера')
						.setURL('https://docs.google.com/document/d/1nldrwFBnT7rf2Pu7jDGGAaIpk6L6nwDd2tja7_c5B2Q/edit')
						.setFooter({ text: 'Отправляя заявку вы принимаете правила сервера' })
						.setColor('#3ba55d')
				],
				ephemeral: true
			})
			await (userBuffer[`modal:${request.id}`] as ModalSubmitInteraction).editReply({ embeds: [Embed(Text_1, Text_2, TextInput, EmbedTitle[0], interaction)], components: [ButtonActionRowUser(request.id, false, false)] })
		}
		else if (interaction.customId.startsWith(`join:user:biography:`)) {
			await interaction.showModal(ModalActionRowBiography(request.id));
		}
	} catch (err) {
		logger.Error(err)
		interaction.replied ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : await interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
	}
})
