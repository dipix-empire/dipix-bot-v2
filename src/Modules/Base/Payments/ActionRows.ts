import { Plan } from "@prisma/client"
import { User, MessageButton, MessageActionRow, MessageSelectMenu } from "discord.js"


export const mainActionRow = (user: User, link: string) => new MessageActionRow()
	.addComponents(
		new MessageButton()
			.setLabel("Пополнить счёт")
			.setStyle('LINK')
			.setURL(link),
		new MessageButton()
			.setLabel("Сменить план")
			.setStyle('SECONDARY')
			.setCustomId(`payments:updatePlan:${user.id}`),
		new MessageButton()
			.setLabel("Пожертвовать")
			.setStyle('SECONDARY')
			.setCustomId(`payments:donate:${user.id}`)
	)

export const updatePlanActionRow = (user: User, plan: Plan) => new MessageActionRow()
	.addComponents(
		new MessageSelectMenu()
			.setCustomId(`payments:updatePlanMenu:${user.id}`)
			.setOptions([
				{label:'Стандартный', value: 'default', description:'Стандартный план ($1.8/мес)', default: plan == 'default'},
				{label:'Спонсорский', value: 'sponsor', description:'Спонсорский план ($1.8/мес)', default: plan == 'sponsor'}
			])
	)