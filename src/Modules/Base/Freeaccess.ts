import { SlashCommandBuilder, SlashCommandUserOption } from "@discordjs/builders";
import { Interaction } from "discord.js";
import ModuleBuilder, { Module } from "../../types/Module";
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent";

export default new ModuleBuilder("freeaccess", async (module: Module) => {
  module.logger.Verbose(module.app.bot.uploadSlashCommand("main", (slashCommand: SlashCommandBuilder) =>
  slashCommand
    .setName("freeaccess")
    .setDescription("Предоставить или забрать доступ")
    .addUserOption((input: SlashCommandUserOption) => input
      .setName("user")
      .setDescription('Пользователь')
      .setRequired(true)
    )
  ))
  module.addEvent(new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isCommand()) return
    if (interaction.commandName != "freeaccess") return
    let user = interaction.options.getUser('user', true);
    const userId = user.id;
    const adminId = interaction.user.id
    const discordUser = await module.app.bot.users.fetch(userId)
    try {
      if (user.bot == true) return interaction.reply({ content: 'нельзя выдать доступ боту', ephemeral: true })
      if (await module.app.prisma.freeaccess.findUnique({ where: { user: userId } })) {
        await module.app.prisma.freeaccess.delete({ where: { user: userId }})
        interaction.reply({ content: 'доступ удален', ephemeral: true })
        await (await discordUser.createDM()).send({ content: 'доступ удален' })
      } else {
        let list = await module.app.prisma.freeaccess.findMany({ where: { admin: adminId } })
        if (list.length > 2) {
          interaction.reply({ content: 'иди нахуй', ephemeral: true })
        } else {
          await module.app.prisma.freeaccess.create({ data: { user: userId, admin: adminId }})
          interaction.reply({ content: 'доступ выдан', ephemeral: true })
          await (await discordUser.createDM()).send({ content: 'доступ выдан' })
        }
      }
    } catch (err) {
      module.logger.Error(err)
    }
  }))
  return module
})