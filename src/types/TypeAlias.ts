import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders"
import Logger from "./Logger"

export type TaskHandlerArgs = {/*logger?: Logger,*/ fireDate: Date, logger:Logger}
export type UploadCommandType = Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">|SlashCommandSubcommandsOnlyBuilder
