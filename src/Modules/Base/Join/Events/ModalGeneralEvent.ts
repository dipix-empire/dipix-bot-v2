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
    const postfixes = ['_1', '_2', '_3', '_4', '_5']
    const textInput = postfixes.map(x => {
      return interaction.fields.getTextInputValue(`join:question${x}`)
    }).filter(x => typeof x === `string`)
    if (!textInput[1].toLowerCase().match(/^[1-9]\d+$/g)) return interaction.reply({ embeds: [ErrorEmbed(`Неверно указан возраст. Заполните заявку еще раз`)], ephemeral: true})
    if (!textInput[3].toLowerCase().match(/^(java|bedrock|оба)$/g)) return interaction.reply({ embeds: [ErrorEmbed(`Неверно указан клиент. Заполните заявку еще раз`)], ephemeral: true})
    let sex = textInput[2] || 'Не указан', promo = textInput[4] || 'Не указан'
    let request = await app.prisma.request.create({
      data: {
        message: '',
        fields: JSON.stringify(textInput),
        locked: false,
        discord: interaction.user.id,
      }
    })
    const embedTitle = ['Ваша заявка на присоединение', `Заявка: ${interaction.user.username}`]
    if (interaction.customId == `join:info_modal`) {
      interaction.reply({ embeds: [Embed(sex, promo, textInput, embedTitle[0], interaction)], components: [ButtonActionRowUser(request.id)], ephemeral: true })
      userBuffer[`modal:${request.id}`] = interaction
    }
  } catch (err) {
    logger.Error(err)
    interaction.replied || interaction.deferred ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
  }
})
