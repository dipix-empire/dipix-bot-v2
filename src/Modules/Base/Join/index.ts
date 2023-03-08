import { ModalBuilder, SlashCommandBuilder, SlashCommandUserOption } from "@discordjs/builders";
import { Message as DMsg, Interaction, ActionRowBuilder, ButtonBuilder, ButtonInteraction, EmbedBuilder, TextChannel, ThreadChannel, ButtonStyle, APIActionRowComponent, APIButtonComponent, TextInputBuilder, TextInputStyle, Collection, ModalSubmitInteraction } from "discord.js";
import { EventEmitter } from "stream";
import App from "../../../App";
import { ErrorEmbed, footer, ProcessingEmbed, SuccesfulEmbed } from "../../../Data/Embeds";
import Message from "../../../types/AppBus/Message";
import AppBusModuleComponent from "../../../types/AppBus/ModuleComponent";
import Logger from "../../../types/Logger";
import Module from "../../../types/Module";
import DiscordEvent from "../../../types/ModuleEvent/DiscordEvent";

import { ButtonActionRowAdmin } from "./Buttons";
import CommandEvent from "./Events/CommandEvent";
import ModalGeneralEvent from "./Events/ModalGeneralEvent";
import UserButtons from "./Events/UserButtons";
import BioModalEvent from "./Events/BioModalEvent";
import AdminButtons from "./Events/AdminButtons";

export default new Module(
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
			// Команда другая
			
			// Разблокировка всех заявок после рестарта бота
			new DiscordEvent("ready", async () => {
				try {
					await app.prisma.request.updateMany({ where: { locked: true }, data: { locked: false } })
				} catch (err) {
					logger.Error(err)
				}
			})
		]
	}
)


