import { Interaction } from "discord.js"
import Embed from "../Embed"
import App from "../../../../App"
import Logger from "../../../../types/Logger"
import DiscordEvent from "../../../../types/ModuleEvent/DiscordEvent"
import { ErrorEmbed } from "../../../../Data/Embeds"
import { ButtonActionRowUser } from "../Buttons"

export default (app: App, logger: Logger, userBuffer: {[key: string]: Interaction} ) => new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
	if (!interaction.isModalSubmit()) return
	if (!interaction.customId.startsWith('join:info_modal')) return
	try {
		const Postfixes = ['_1', '_2', '_3', '_4', '_5']
		const TextInput = Postfixes.map(x => {
			return interaction.fields.getTextInputValue(`join:question${x}`)
		}).filter(x => typeof x === `string`)

		if (!TextInput[1].toLowerCase().match(/^[1-9]\d+$/g)) { return interaction.reply({embeds: [ErrorEmbed(`Неверно указан возраст. Заполните заявку еще раз`)], ephemeral: true}) }
		if (!TextInput[3].toLowerCase().match(/^(java|bedrock|оба)$/g)) { return interaction.reply({embeds: [ErrorEmbed(`Неверно указан клиент. Заполните заявку еще раз`)], ephemeral: true}) }

		let Text_1 = TextInput[2] || 'Не указан', Text_2 = TextInput[4] || 'Не указан'

		let request = await app.prisma.request.create({
			data: {
				message: '',
				fields: JSON.stringify(TextInput),
				locked: false,
				discord: interaction.user.id,
			}
		})

		const EmbedTitle = ['Ваша заявка на присоединение', `Заявка: ${interaction.user.username}`]
		if (interaction.customId == `join:info_modal`) {
			interaction.reply({ embeds: [Embed(Text_1, Text_2, TextInput, EmbedTitle[0], interaction)], components: [ButtonActionRowUser(request.id)], ephemeral: true })
			userBuffer[`modal:${request.id}`] = interaction
		}
	} catch (err) {
		logger.Error(err)
		interaction.replied || interaction.deferred ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
	}
})
