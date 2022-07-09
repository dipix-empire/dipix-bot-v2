import { MessageEmbed } from "discord.js";

export const ErrorEmbed = (comment = "Произошла непредвиденная ошибка.") => new MessageEmbed()
	.setColor('#c62828')
	.setTitle('Ошибка!')
	.setDescription(comment)
	.setTimestamp(Date.now())
	.setFooter({
		text: 'DiPix Bot © Philainel, 2022'
	})
export const SuccesfulEmbed = (comment = "Команда успешно выполнено.") => new MessageEmbed()
	.setColor('GREEN')
	.setTitle('Успешно!')
	.setDescription(comment)
	.setTimestamp(Date.now())
	.setFooter({
		text: 'DiPix Bot © Philainel, 2022'
	})