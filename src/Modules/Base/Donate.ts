import { SlashCommandBuilder, SlashCommandUserOption } from "@discordjs/builders";
import { Interaction } from "discord.js";
import ModuleBuilder, { Module } from "../../types/Module";
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent";

export default new ModuleBuilder("donate", async (module: Module) => {
  module.logger.Verbose(module.app.bot.uploadSlashCommand("main", (slashCommand: SlashCommandBuilder) =>
  slashCommand
    .setName("donate")
    .setDescription("Предоставить или забрать доступ")
    .addUserOption((input: SlashCommandUserOption) => input
      .setName("user")
      .setDescription('Пользователь')
      .setRequired(true)
    )
  ))
  module.addEvent(new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isCommand()) return
    if (interaction.commandName != "donate") return
    let user = interaction.options.getUser('user', true);
    const userId = user.id;
    try {
    } catch (err) {
      module.logger.Error(err)
    }
  }))
  return module
})