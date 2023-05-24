import { SlashCommandBuilder, SlashCommandUserOption } from "@discordjs/builders";
import { Interaction } from "discord.js";
import ModuleBuilder, { Module } from "../../../types/Module";

import CommandEvent from "./Events/CommandEvent";
import ModalGeneralEvent from "./Events/ModalGeneralEvent";
import UserButtons from "./Events/UserButtons";
import BioModalEvent from "./Events/BioModalEvent";
import AdminButtons from "./Events/AdminButtons";
import Autoaccept from "./Misc/Autoaccept";
import UnlockOnLoad from "./Misc/UnlockOnLoad";
import DiscussionButtons from "./Events/DiscussionButtons";

export default new ModuleBuilder(
  "join",
  async (module: Module) => {
    module.logger.Verbose(module.app.bot.uploadSlashCommand("main", (slashCommand: SlashCommandBuilder) =>
      slashCommand
        .setName("join")
        .setDescription("Написать заявку для присоединения к серверу.")
    ))
    module.logger.Verbose(module.app.bot.uploadSlashCommand("main", (slashCommand: SlashCommandBuilder) =>
      slashCommand
        .setName("autoaccept")
        .setDescription("Автоматически принять заявку игрока.")
        .addUserOption((option: SlashCommandUserOption) =>
          option
            .setName('user')
            .setDescription('Юзер')
            .setRequired(true)
        )
    ))

    let userBuffer: { [key: string]: Interaction } = {}
    module.addEvent(
      CommandEvent(module.app, module.logger),          // Команда
      ModalGeneralEvent(module.app, module.logger, userBuffer), // Модалка основная инфа
      UserButtons(module.app, module.logger, userBuffer),   // Кнопки Юзера
      BioModalEvent(module.app, module.logger),         // Модалка биография
      AdminButtons(module.app, module.logger),          // Кнопки Админ
      DiscussionButtons(module.app, module.logger),       // Кнопки дисскуссий
      Autoaccept(module.app, module.logger),          // Команда другая
      UnlockOnLoad(module.app, module.logger)         // Разблокировка всех заявок после рестарта бота
    )
    return module
  }
)