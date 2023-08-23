import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { Interaction } from "discord.js";
import ModuleBuilder, { Module } from "../../types/Module";
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent";

export default new ModuleBuilder("subscribe", async (module: Module) => {
  module.logger.Verbose(module.app.bot.uploadSlashCommand("main", (slashCommand: SlashCommandBuilder) =>
  slashCommand
    .setName("subscribe")
    .setDescription("Выбор и оплата подписки")
    .addStringOption((input: SlashCommandStringOption) => input
      .setName("plan")
      .setDescription("Тарифный план")
      .setRequired(true)
      .addChoices(
        { name: 'Стандартный x1', value: 'standard_x1' },
        { name: 'Стандартный x4', value: 'standard_x4' },
        { name: 'Стандартный x12', value: 'standard_x12' },
        { name: 'Спонсорский x1', value: 'sponsorship_x1' },
        { name: 'Спонсорский x2', value: 'sponsorship_x2' },
        { name: 'Спонсорский x12', value: 'sponsorship_x12' }
      )
    )
  ))
  module.addEvent(new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return
    if (interaction.commandName != "subscribe") return
    const category = interaction.options.getString('plan', true);
    try {
      interaction.reply({ content: `${category}` })
      console.log(category)
    } catch (err) {
      module.logger.Error(err)
    }
  }))
  return module
})
