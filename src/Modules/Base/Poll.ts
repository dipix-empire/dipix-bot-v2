import { SlashCommandBuilder, SlashCommandStringOption, SlashCommandIntegerOption, SlashCommandAttachmentOption } from "@discordjs/builders";
import { ActionRowBuilder, Interaction, StringSelectMenuBuilder } from "discord.js";
import ModuleBuilder, { Module } from "../../types/Module";
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent";

export default new ModuleBuilder("poll", async (module: Module) => {
  module.logger.Verbose(module.app.bot.uploadSlashCommand("main", (slashCommand: SlashCommandBuilder) => slashCommand
    .setName("poll")
    .setDescription("Создать опрос")
    .addStringOption((option: SlashCommandStringOption) => option
      .setName('question')
      .setDescription('Задать вопрос')
      .setRequired(true)
    )
    .addIntegerOption((option: SlashCommandIntegerOption) => option
      .setName('time')
      .setDescription('Время опроса')
      .setRequired(true)
    )
    .addStringOption((option: SlashCommandStringOption) => option
      .setName('answer_1')
      .setDescription('Ответ 1')
      .setRequired(true)
    )
    .addStringOption((option: SlashCommandStringOption) => option
      .setName('answer_2')
      .setDescription('Ответ 2')
      .setRequired(true)
    )
    .addStringOption((option: SlashCommandStringOption) => option
      .setName('answer_3')
      .setDescription('Ответ 3')
    )
    .addStringOption((option: SlashCommandStringOption) => option
      .setName('answer_4')
      .setDescription('Ответ 4')
    )
    .addStringOption((option: SlashCommandStringOption) => option
      .setName('answer_5')
      .setDescription('Ответ 5')
    )
    .addStringOption((option: SlashCommandStringOption) => option
      .setName('answer_6')
      .setDescription('Ответ 6')
    )
    .addStringOption((option: SlashCommandStringOption) => option
      .setName('answer_7')
      .setDescription('Ответ 7')
    )
    .addStringOption((option: SlashCommandStringOption) => option
      .setName('answer_8')
      .setDescription('Ответ 8')
    )
    .addStringOption((option: SlashCommandStringOption) => option
      .setName('answer_9')
      .setDescription('Ответ 9')
    )
    .addAttachmentOption((option: SlashCommandAttachmentOption) => option
      .setName('attachment')
      .setDescription('Вложение')
    )
  ))
  module.addEvent(new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isCommand()) return
    if (interaction.commandName != "poll") return
    if (!interaction.isChatInputCommand()) return
    try {
      const postfixes = ['_1', '_2', '_3', '_4', '_5', '_6', '_7', '_8', '_9']
      const voited = [0, 0, 0, 0, 0, 0, 0, 0, 0]
      const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']

      const question = interaction.options.getString('question')
      const time = interaction.options.getInteger('time')
      const attachment = interaction.options.getAttachment('attachment')

      const textOption = postfixes.map(x => {
        return interaction.options.getString(`answer${x}`)
      }).filter(x => typeof x === `string`)
      const selectComponents = textOption.map((x, i) => {
        return {
          label: `[${voited[i]}] ${textOption[i]}`,
          value: `${postfixes[i]}`,
          emoji: emojis[i]
        }
      })
      interaction.reply({
        content: `${question}`,
        components: [
          new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
              new StringSelectMenuBuilder()
                .setPlaceholder(`время опроса: ${time} мин`)
                .addOptions(selectComponents)
                .setCustomId(`poll_${interaction.id}`)
            )
        ]
      })
    } catch (err) {
      module.logger.Error(err)
    }
  }))
  return module
})