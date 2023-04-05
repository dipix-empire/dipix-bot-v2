import { ModalBuilder, SlashCommandBuilder, SlashCommandUserOption } from "@discordjs/builders";
import { Message as DMsg, Interaction, ActionRowBuilder, ButtonBuilder, ButtonInteraction, EmbedBuilder, TextChannel, ThreadChannel, ButtonStyle, APIActionRowComponent, APIButtonComponent, TextInputBuilder, TextInputStyle, Collection, ModalSubmitInteraction } from "discord.js";
import { EventEmitter } from "stream";
import App from "../../../App";
import { ErrorEmbed, footer, ProcessingEmbed, SuccesfulEmbed } from "../../../Data/Embeds";
import Message from "../../../types/AppBus/Message";
import AppBusModuleComponent from "../../../types/AppBus/ModuleComponent";
import Logger from "../../../types/Logger";
import ModuleBuilder from "../../../types/Module";
import DiscordEvent from "../../../types/ModuleEvent/DiscordEvent";

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
	async (app: App, appBusModule: AppBusModuleComponent, logger: Logger) => {
		logger.Verbose(app.bot.uploadCommand("main", (slashCommand: SlashCommandBuilder) =>
			slashCommand
				.setName("join")
				.setDescription("Написать заявку для присоединения к серверу.")
		))
		logger.Verbose(app.bot.uploadCommand("main", (slashCommand: SlashCommandBuilder) =>
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

		let userBuffer: {[key: string]: Interaction} = {} 
		return [
			CommandEvent(app, logger),					// Команда
			ModalGeneralEvent(app, logger, userBuffer),	// Модалка основная инфа
			UserButtons(app, logger, userBuffer),		// Кнопки Юзера
			BioModalEvent(app, logger),					// Модалка биография
			AdminButtons(app, logger),					// Кнопки Админ
			DiscussionButtons(app, logger),				// Кнопки дисскуссий
			Autoaccept(app, logger),					// Команда другая
			UnlockOnLoad(app, logger)					// Разблокировка всех заявок после рестарта бота
		]
	}
)


