import { ButtonInteraction } from "discord.js";
import { Module } from "../../../../types/Module";
import { ErrorEmbed } from "../../../../Data/Embeds";

export default async (module: Module, interaction: ButtonInteraction) => {
	return ErrorEmbed("Не реализовано")
}
