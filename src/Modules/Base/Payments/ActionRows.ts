import { Plan } from "@prisma/client"
import { User, ButtonBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonStyle, APIActionRowComponent, APIButtonComponent } from "discord.js"


export const mainActionRow = (user: User, link: string) => new ActionRowBuilder()
	.addComponents(
		new ButtonBuilder()
			.setLabel("Пополнить счёт")
			.setStyle(ButtonStyle.Link)
			.setURL(link),
		new ButtonBuilder()
			.setLabel("Сменить план")
			.setStyle(ButtonStyle.Secondary)
			.setCustomId(`payments:updatePlan:${user.id}`),
		new ButtonBuilder()
			.setLabel("Пожертвовать")
			.setStyle(ButtonStyle.Secondary)
			.setCustomId(`payments:donate:${user.id}`)
	)
	.toJSON() as APIActionRowComponent<APIButtonComponent>

export const updatePlanActionRow = (user: User, plan: Plan) => new ActionRowBuilder()
	.addComponents(
		new StringSelectMenuBuilder()
			.setCustomId(`payments:updatePlanMenu:${user.id}`)
			.setOptions([
				{ label: 'Стандартный', value: 'default', description: 'Стандартный план ($1.8/мес)', default: plan == 'default' },
				{ label: 'Спонсорский', value: 'sponsor', description: 'Спонсорский план ($1.8/мес)', default: plan == 'sponsor' }
			])
	)
	.toJSON() as APIActionRowComponent<APIButtonComponent>
