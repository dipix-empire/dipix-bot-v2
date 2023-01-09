import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders"
import Logger from "./Logger"

export type TaskHandlerArgs = {/*logger?: Logger,*/ fireDate: Date}
export type UploadCommandType = Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">|SlashCommandSubcommandsOnlyBuilder
