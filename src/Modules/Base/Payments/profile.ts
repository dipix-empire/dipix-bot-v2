import { SlashCommandBuilder } from "discord.js";
import App from "../../../App";
import Logger from "../../../types/Logger";

export default (app: App, logger: Logger) => {
	logger.Verbose(app.bot.uploadCommand("main", (slashCommandBuilder: SlashCommandBuilder) => 
		slashCommandBuilder
			.setName("payments")
			.setDescription("Управление подпиской")
	))
}
