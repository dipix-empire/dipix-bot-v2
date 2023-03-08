import { ActionRowBuilder, ButtonBuilder, ButtonStyle, APIActionRowComponent, APIButtonComponent } from "discord.js"

export const ButtonActionRowAdmin = (reqID: string, disabled = false, success = false) =>
	new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId(`join:admin:accept:${reqID}`)
				.setLabel('Принять')
				.setStyle(success ? ButtonStyle.Success : ButtonStyle.Primary)
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
export const ButtonActionRowUser = (reqID: string, disabledSend = true, disabledAll = false) =>
	new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId(`join:user:send:${reqID}`)
				.setLabel('Отправить')
				.setStyle(disabledSend ? ButtonStyle.Secondary : ButtonStyle.Primary)
				.setDisabled(disabledAll || disabledSend),
			new ButtonBuilder()
				.setCustomId(`join:user:rules:${reqID}`)
				.setLabel('Правила')
				.setStyle(disabledSend ? ButtonStyle.Primary : ButtonStyle.Secondary)
				.setDisabled(disabledAll),
			new ButtonBuilder()
				.setCustomId(`join:user:biography:${reqID}`)
				.setLabel('Биография')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(disabledAll)
		)
		.toJSON() as APIActionRowComponent<APIButtonComponent>
