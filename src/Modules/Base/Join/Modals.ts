import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from "discord.js"

export const ModalActionRowQuestion = new ModalBuilder()
	.setCustomId(`join:info_modal`)
	.setTitle('Заявка на присоединение')
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
export const ModalActionRowBiography = (reqID: string) => new ModalBuilder()
	.setCustomId(`join:bio_modal:${reqID}`)
	.setTitle('редактирование')
	.addComponents(
		new ActionRowBuilder<TextInputBuilder>()
			.addComponents(
				new TextInputBuilder()
					.setCustomId(`join:biography`)
					.setLabel('Биография')
					.setPlaceholder('Биография вашего персонажа для РП')
					.setStyle(TextInputStyle.Paragraph)
			)
	)
