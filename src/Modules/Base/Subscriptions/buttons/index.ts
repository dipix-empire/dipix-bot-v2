import { Interaction } from "discord.js";
import { Module } from "../../../../types/Module";
import DiscordEvent from "../../../../types/ModuleEvent/DiscordEvent";
import { ErrorEmbed } from "../../../../Data/Embeds";
import history from "./history";
import update from "./update";
import change from "./change";

export default (module: Module) => module.addEvent(new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
	if (!interaction.isButton()) return
	if (!interaction.customId.startsWith("sub:button:")) return
	try {
		await interaction.deferReply({ ephemeral: true })
		let id = interaction.customId.split(":")[2]
		let active = interaction.customId.split(":")[3] == "1"
		switch (id) {
			case "update":
				return await interaction.editReply({ embeds: [await update(module, interaction)] })
			case "history":
				return await interaction.editReply({ embeds: [await history(module, interaction)] })
			case "change":
				return await interaction.editReply({ embeds: [await change(module, interaction)] })
			default:
				return await interaction.editReply({ embeds: [ErrorEmbed("Button action not defined.")] })
		}
	} catch (err) {
		module.logger.Error(err);
		(interaction.replied || interaction.deferred) ?
			await interaction.editReply({ embeds: [ErrorEmbed()] }) :
			await interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
	}
}))

function color(active: boolean) {

}
