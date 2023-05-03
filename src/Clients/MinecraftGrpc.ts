/**
 * ! DEPRECATED
 * ! REPLACED WITH REST API ON BOT
 */

import { EventEmitter } from "events";
import Logger from "../types/Logger";
import { Server, ServerCredentials, ServerDuplexStream, credentials } from "@grpc/grpc-js";
import { ChatMessage, ConsoleCommand, ConsoleLog, Empty, PlayerList } from "../generated/proto/dipix-bot_pb";
import { BotToMinecraftClient, BotToMinecraftService, IMinecraftToBotServer, MinecraftToBotService } from "../generated/proto/dipix-bot_grpc_pb";

export default class Minecraft extends EventEmitter {
	constructor(
		address: string,
		private readonly port: number,
		private readonly logger: Logger
	) {
		super()
		logger.Log(`Building gRPC stubs to ${address}`)
		this.client = new BotToMinecraftClient(address, credentials.createInsecure())
		this.server = new Server()
		this.server.addService(MinecraftToBotService, this.serverImpl)
		logger.Debug("Build gRPC server.", this.server)
	}

	private readonly client: BotToMinecraftClient
	private readonly server: Server
	private readonly localee: MinecraftLocalEE = new MinecraftLocalEE()

	public async getPlayers() {
		return new Promise<PlayerList>((resolve, reject) => {
			this.client.getPlayers(new Empty(), (err: any, response: PlayerList) => {
				if (err) return reject(err)
				resolve(response)
			})
		})
	}
	public async reconnect() {
		return new Promise<Empty>((resolve, reject) => {
			this.client.reconnect(new Empty(), (err: any, response: Empty) => {
				if (err) return reject(err)
				resolve(response)
			})
		})
	}
	public sendChatMessage(sender: string, content: string) {
		return this.localee.emit("msg", content, sender)
	}
	public sendCommand(cmd: string) {
		return this.localee.emit("cmd", cmd)
	}

	public start() {
		this.server.bindAsync(`0.0.0.0:${this.port}`, ServerCredentials.createInsecure(), (err: Error | null, port: number) => {
			this.server.start()
			this.logger.Log(`gRPC server started on 0.0.0.0:${port}`)
			this.reconnect().catch((err: Error | unknown) => {
				this.logger.VerboseError(err, "Error while send reconnect request to server. Is it started up?")
				this.logger.Error(new Error("Can't connect minecraft server."))
			})
		})
	}
	public async stop() {
		this.logger.Log("Shutting down gRPC server...")
		return new Promise<void>((resolve, reject) => {
			this.server.tryShutdown((err: Error | unknown) => {
				if (err) return reject(err)
				resolve()
			})
		})
	}
	
	private serverImpl: IMinecraftToBotServer = {
		consolePool: (call: ServerDuplexStream<ConsoleLog, ConsoleCommand>) => {
			this.logger.Verbose(`Connected ConsolePool duplex. Peer: ${call.getPeer()}`)
			call.on("data", (data: ConsoleLog) => {
				this.emit("log", { raw: data.getRaw() })
			})
			let cmdHandler = async (cmd: string) => {
				call.write(new ConsoleCommand().setCmd(cmd))
			}
			this.localee.on("cmd", cmdHandler)
			call.on("end", () => this.localee.off("cmd", cmdHandler))
		},
		messagePool: (call: ServerDuplexStream<ChatMessage, ChatMessage>) => {
			this.logger.Verbose(`Connected MessagePool duplex. Peer: ${call.getPeer()}`)
			call.on("data", (data: ChatMessage) => {
				this.emit("msg", { content: data.getContent(), sender: data.getSender() })
			})
			const msgHandler = async (content: string, sender: string) => {
				call.write(new ChatMessage().setSender(sender).setContent(content));
			};
			this.localee.on("msg", msgHandler)
			call.on("end", () => this.localee.off("msg", msgHandler))
		}
	}

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
}

export type MinecraftEventTypes = {
	"log": [log: { raw: string }],
	"msg": [msg: { sender: string, content: string }]
}
type MinecraftLocalEETypes = {
	"msg": [sender: string, content: string],
	"cmd": [cmd: string]
}
class MinecraftLocalEE extends EventEmitter {
	public override on<T extends keyof MinecraftLocalEETypes>(event: T, listener: (...data: MinecraftLocalEETypes[T]) => any) {
		super.on(event, listener as any)
		return this
	}
	public override once<T extends keyof MinecraftLocalEETypes>(event: T, listener: (...data: MinecraftLocalEETypes[T]) => any) {
		super.once(event, listener as any)
		return this
	}
	public override off<T extends keyof MinecraftLocalEETypes>(event: T, listener: (...data: MinecraftLocalEETypes[T]) => any) {
		super.off(event, listener as any)
		return this
	}
	public override emit<T extends keyof MinecraftLocalEETypes>(event: T, ...data: MinecraftLocalEETypes[T]) {
		super.emit(event, ...data)
		return !!super.listenerCount(event)
	}
	constructor() {
		super()
	}
}
