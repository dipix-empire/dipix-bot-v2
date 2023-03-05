import { EventEmitter } from "events";
import Logger from "../types/Logger";
import { ChatMessageServiceClient, StatsClient } from "../generated/proto/dipix-bot_grpc_pb"
import { ClientDuplexStream, ServerDuplexStream, credentials } from "@grpc/grpc-js";
import { ChatMessage, ConsoleCommand, ConsoleLog, Empty, PlayerList } from "../generated/proto/dipix-bot_pb";
import Task from "../types/Task";
import { TaskHandlerArgs } from "../types/TypeAlias";
import MinecraftEvent from "../types/ModuleEvent/MinecraftEvent";

export default class Minecraft {
	private pingTask: Task | undefined
	public readonly statsClient: StatsClient
	public readonly chatMessageClient: ChatMessageServiceClient

	public async getPlayers() {
		return new Promise<PlayerList>((resolve, reject) => {
			// if (!this.connected) return reject(new Error("No connection available."))
			this.statsClient.getPlayers(new Empty(), (err: any, response: PlayerList) => {
				if (err) return reject(err)
				resolve(response)
			})
		})
	}
	public sendChatMessage(sender: string, content: string) {

	}
	public sendCommand(cmd: string) {

	}

	constructor(
		address: string,
		private readonly logger: Logger
	) {
		this.statsClient = new StatsClient(address, credentials.createInsecure())
		this.chatMessageClient = new ChatMessageServiceClient(address, credentials.createInsecure())

		// this.pingTask = new Task("PingTask", ({}: TaskHandlerArgs) => {
		// 	if (!this.client) return this.initiate()
		// 	this.client.statsClient.pingServer(new Empty(), (err: Error, response: Empty) => {
		// 		if (err) return this.initiate()
		// 	})
		// })
	}
}

// class MinecraftBidiStreamWatcher extends EventEmitter {
// 	private status: ConnectionStatus = ConnectionStatus.connected
// 	public sendMessage(msg: ChatMessage) {
// 		this.chatStream.write(msg)
// 	}
// 	public sendCommand(cmd: ConsoleCommand) {
// 		this.consoleStream.write(cmd)
// 	}

// 	private emitClose() {
// 		this.logger.Debug("Connection closed...")
// 		this.status = ConnectionStatus.disconnected
// 		this.emit("disconnect")
// 	}
// 	private emitError(err: Error | unknown) {
// 		this.logger.Debug("Connection thrown an error...")
// 		this.status = ConnectionStatus.disconnected
// 		this.emit("err", err)
// 		this.emit("disconnect")
// 	}

// 	private onMessage(msg: ChatMessage) {
// 		this.emit("chat", { sender: msg.getSender(), content: msg.getContent() })
// 	}
// 	private onLog(log: ConsoleLog) {
// 		this.emit("log", { raw: log.getContent() })
// 	}

// 	public override on<T extends keyof MinecraftWatcherEventTypes>(key: T, listener: (...args: MinecraftWatcherEventTypes[T]) => any) {
// 		super.on(key, listener as any)
// 		return this
// 	}
// 	public override once<T extends keyof MinecraftWatcherEventTypes>(key: T, listener: (...args: MinecraftWatcherEventTypes[T]) => any) {
// 		super.on(key, listener as any)
// 		return this
// 	}
// 	public override off<T extends keyof MinecraftWatcherEventTypes>(key: T, listener: (...args: MinecraftWatcherEventTypes[T]) => any) {
// 		super.off(key, listener as any)
// 		return this
// 	}
// 	public override emit<T extends keyof MinecraftWatcherEventTypes>(key: T, ...args: MinecraftWatcherEventTypes[T]) {
// 		super.emit(key, ...args)
// 		return !!super.listenerCount(key)
// 	}

// 	constructor(
// 		private readonly chatStream: ClientDuplexStream<ChatMessage, ChatMessage>,
// 		private readonly consoleStream: ClientDuplexStream<ConsoleCommand, ConsoleLog>,
// 		private readonly logger: Logger
// 	) {
// 		super()
// 		chatStream.on("close", this.emitClose)
// 		consoleStream.on("close", this.emitClose)
// 		chatStream.on("error", this.emitError)
// 		consoleStream.on("error", this.emitError)

// 		chatStream.on("data", this.onMessage)
// 		consoleStream.on("data", this.onLog)
// 	}
// }
