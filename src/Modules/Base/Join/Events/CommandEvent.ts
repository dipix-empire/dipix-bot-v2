import App from "../../../../App";
import Logger from "../../../../types/Logger";
import DiscordEvent from "../../../../types/ModuleEvent/DiscordEvent";
import { ErrorEmbed } from "../../../../Data/Embeds";
import { ModalActionRowQuestion } from "../Modals";
import { Interaction } from "discord.js";
export default (app: App, logger: Logger) => {
	return new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
		if (!interaction.isCommand() || interaction.commandName != "join")
			return;
		try {
			if (await app.prisma.user.findFirst({ where: { discord: interaction.user.id } }) != null)
				return interaction.reply({ embeds: [ErrorEmbed('❌ Вы уже игрок. (How Did We Get Here?)')], ephemeral: true });
			else { await interaction.showModal(ModalActionRowQuestion); }
		} catch (err) {
			logger.Error(err);
			interaction.replied ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : await interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true });
		}
	});
}
