import { footer } from "../../../Data/Embeds"
import { Interaction, EmbedBuilder } from "discord.js"

export default (Sex: string, Promo: string, textInput: string[], embedTitle: string, interaction: Interaction) => new EmbedBuilder()
  .setTitle(embedTitle)
  .setURL(`https://discordapp.com/users/${interaction.user.id}/`)
  .addFields(
    { name: 'Ник в Майнкрафт', value: `${textInput[0]}`, inline: true },
    { name: 'Пол', value: `${Sex}`, inline: true },
    { name: 'Возраст', value: `${textInput[1]}`, inline: true },
    { name: 'Пригласил / Промокод', value: `${Promo}`, inline: true },
    { name: 'Клиент', value: `${textInput[3]}`, inline: true }
  )
  .setColor('#3ba55d')
  .setFooter(footer)
  .setTimestamp(Date.now())
