import { Colors, Embed, EmbedBuilder, WebhookClient } from "discord.js"
import { footer } from "../Data/Embeds"
import { config } from "dotenv"
import secrets from "../../secrets"

export default class Logger {

	private static readonly webhookLink: string = secrets.webhook_url
	private static readonly webhook: WebhookClient = new WebhookClient({ url: Logger.webhookLink })
	public readonly template = (level: string, message: string) =>
		`[${new Date().toLocaleTimeString()} ${level.toUpperCase()} (${this.type ? `${this.type[0].toUpperCase()}/` : ""}${this.source.toUpperCase()})]: ${message}`

	public Error(err: Error | unknown, msg: string = "An Error have been catched:") {
		if (this.level < 0) return
		console.error(this.template("ERRO", msg))
		console.error(err)
		this.sendWebhook("ERRO", msg)
	}
	public Warn(msg: string) {
		if (this.level < 1) return
		console.log(this.template("WARN", msg))
		this.sendWebhook("WARN", msg)
	}
	public Log(msg: string) {
		if (this.level < 2) return
		console.log(this.template("INFO", msg))
		this.sendWebhook("INFO", msg)
	}
	public Verbose(msg: string) {
		if (this.level < 3) return
		console.log(this.template("VERB", msg))
		this.sendWebhook("VERB", msg)
	}
	public VerboseError(err: Error | unknown, msg: string = "Unimportant exception have been catched: ") {
		if (this.level < 3) return
		console.error(this.template("VERR", msg))
		console.error(err)
		this.sendWebhook("VERR", msg)
	}
	public Debug(msg: string, ...data: any) {
		if (this.level < 4) return
		console.log(this.template("DEBUG", msg))
		if (data.length > 0) console.log(...data)
	}
	public getChild(name: string) {
		return new Logger(`${this.source}/${name}`, this.level, "module")
	}
	private sendWebhook(level: string, message: string) {
		Logger.webhook.send({
			embeds: [
				new EmbedBuilder()
					.setTitle(`${level.toUpperCase()} ${this.type ? `${this.type[0].toUpperCase()}/` : ""}${this.source.toUpperCase()}`)
					.setDescription(message)
					.setTimestamp(Date.now())
					.setColor(this.getWebhookColor(level))
					.setFooter(footer)
			]
		}).catch(console.error)
	}
	private getWebhookColor(level: string) {
		switch (level) {
			case "ERRO":
				return Colors.Red
			case "WARN":
				return Colors.Yellow
			case "INFO":
				return Colors.Green
			case "VERB":
				return Colors.White
			case "VERR":
				return Colors.DarkRed
			default:
				return null
		}
	}
	constructor(
		public readonly source: string,
		public readonly level: logLevel,
		public readonly type?: "client" | "module",
	) { }
}
export enum logLevel {
	ERROR = 0,
	WARN = 1,
	INFO = 2,
	VERBOSE = 3,
	DEBUG = 4
}
