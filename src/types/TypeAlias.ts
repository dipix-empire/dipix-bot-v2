import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder, ContextMenuCommandBuilder } from "@discordjs/builders"
import Logger from "./Logger"

export type TaskHandlerArgs = {/*logger?: Logger,*/ fireDate: Date, logger: Logger }
export type UploadSlashCommandType = Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> | SlashCommandSubcommandsOnlyBuilder
export type UploadContextMenuCommandType = ContextMenuCommandBuilder
export type UploadCommandType = UploadContextMenuCommandType | UploadSlashCommandType
export type Promisable<T extends any> = T | Promise<T>
export type MinecraftRCONProps = { host: string, port: number, password: string, timeout: number }
