import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders"

export type UploadCommandType = Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">|SlashCommandSubcommandsOnlyBuilder