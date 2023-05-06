import { EventEmitter } from "events";
import Logger from "../types/Logger";
import express, { Request, Response } from "express"
import { Server } from "http";
export default class Minecraft extends EventEmitter {

	private readonly app: express.Application
	private server: Server | null = null
	constructor(
		private readonly port: number,
		private readonly logger: Logger
	) {
		super()
		this.app = express()
		this.app.use(express.json())
	}
	//#region Routes Impl
	private readonly status = (req: Request, res: Response) => {
		this.logger.Debug("/status req.query: ", req.query)
		let online = req.query.online == "true"
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

	public start() {

		this.app.get("/status", this.status)
		this.app.post("/player", this.player)
		this.app.post("/chat", this.chat)

		this.server = this.app.listen(this.port, () => {
			this.logger.Log(`Minecraft REST API server started at ${this.port}`)
		})
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

	public sendChatMessage(sender: string, msg: string): boolean {
		this.logger.Error(new Error("NOT IMPLEMENTED"))
		return false
	}
	public sendCommand(cmd: string): boolean {
		this.logger.Error(new Error("NOT IMPLEMENTED"))
		return false
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
