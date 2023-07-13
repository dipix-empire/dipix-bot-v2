import { EventEmitter } from "events";
import Logger from "../types/Logger";
import express, { Request, Response } from "express"
import { Server } from "http";
import Rcon, { State } from "rcon-ts"
import { MinecraftRCONProps } from "../types/TypeAlias";

export default class Minecraft extends EventEmitter {

	private readonly app: express.Application
	private server: Server | null = null
	private rcon: Rcon
	constructor(
		private readonly port: number,
		private readonly logger: Logger,
		private readonly format: (s: string, m: string) => string,
		rconProps: MinecraftRCONProps
	) {
		super()
		this.app = express()
		this.app.use(express.json())
		this.rcon = new Rcon({
			...rconProps
		})
	}
	//#region Routes Impl
	private readonly status = async (req: Request, res: Response) => {
		this.logger.Debug("/status req.query: ", req.query)
		let online = req.query.online == "true"
		if (online) {
			this.isConnectedToRCON() || await this.connectRcon()
		}
		this.emit("status", { online })
		res.status(200).send("")
	}
	private readonly player = (req: Request, res: Response) => {
		this.logger.Debug("/player req.query: ", req.query)
		this.logger.Debug("/player req.body: ", req.body)
		let online = req.body.online == "true"
		let name = `${req.query.name}`
		this.emit("player", { name, online })
		res.status(200).send("")
	}
	private readonly chat = (req: Request, res: Response) => {
		this.logger.Debug("/chat req.body: ", req.body)
		this.emit("message", { sender: req.body.player, content: req.body.message })
		res.status(200).send("")
	}
	//#endregion

	//#region RCON methods implement
	public isConnectedToRCON() {
		switch(this.rcon.state) {
			case State.Refused:
			case State.Disconnected:
			case State.Connecting:
				return false;
		}
		return true
	}

	public async sendCommand(data: string) {
		if (!this.isConnectedToRCON()) throw new Error("Not connected")
		return await this.rcon.send(data)
	}
	public async sendChatMessage(sender: string, msg: string) {
		return await this.sendCommand(`/tellraw @a ${this.format(sender, msg)}`)
	}
	private async connectRcon() {
		try {
			this.logger.Log("Connecting to RCON server...")
			await this.rcon.connect()
			this.logger.Log("Connection to RCON established.")
		} catch(err) {
			this.logger.Error(err, "RCON connection attempt failed with error")
		}
	}
	//#endregion

	public start() {

		this.app.get("/status", this.status)
		this.app.post("/player", this.player)
		this.app.post("/chat", this.chat)

		this.server = this.app.listen(this.port, () => {
			this.logger.Log(`Minecraft REST API server started at ${this.port}`)
		})

		this.connectRcon()
	}
	
	public async stop() {
		return new Promise<void>((res, rej) => {
			if (!this.server) res()
			this.server?.close((err: Error | any) => {
				if (err) rej(err)
				this.logger.Log("Server closed")
				res()
			})
		})
	}

	//#region Typed Emitter Impl
	public override on<T extends keyof MinecraftEventTypes>(event: T, listener: (...data: MinecraftEventTypes[T]) => any) {
		super.on(event, listener as any)
		return this
	}
	public override once<T extends keyof MinecraftEventTypes>(event: T, listener: (...data: MinecraftEventTypes[T]) => any) {
		super.once(event, listener as any)
		return this
	}
	public override off<T extends keyof MinecraftEventTypes>(event: T, listener: (...data: MinecraftEventTypes[T]) => any) {
		super.off(event, listener as any)
		return this
	}
	public override emit<T extends keyof MinecraftEventTypes>(event: T, ...data: MinecraftEventTypes[T]) {
		super.emit(event, ...data)
		return !!super.listenerCount(event)
	}
	//#endregion
}

export type MinecraftEventTypes = {
	"log": [log: { raw: string }],
	"message": [msg: { sender: string, content: string }],
	"status": [status: { online: boolean }],
	"player": [player: { name: string, online: boolean }]
}
