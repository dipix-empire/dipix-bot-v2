import { footer } from "../../../Data/Embeds"
import { Interaction, EmbedBuilder } from "discord.js"

export default (Sex: string, Promo: string, TextInput: string[], EmbedTitle: string, interaction: Interaction) => new EmbedBuilder()
	.setTitle(EmbedTitle)
	.setURL(`https://discordapp.com/users/${interaction.user.id}/`)
	.addFields(
		{ name: 'Ник в Майнкрафт', value: `${TextInput[0]}`, inline: true },
		{ name: 'Пол', value: `${Sex}`, inline: true },
		{ name: 'Возраст', value: `${TextInput[1]}`, inline: true },
		{ name: 'Пригласил / Промокод', value: `${Promo}`, inline: true },
		{ name: 'Клиент', value: `${TextInput[3]}`, inline: true }
	)
	.setColor('#3ba55d')
	.setFooter(footer)
	.setTimestamp(Date.now())
