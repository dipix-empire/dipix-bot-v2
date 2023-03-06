import { ChatMessageServiceService, IChatMessageServiceServer, IStatsServer, StatsService } from "../src/generated/proto/dipix-bot_grpc_pb";
import { Server, ServerCredentials, ServerDuplexStream, ServerUnaryCall, ServerWritableStream, sendUnaryData } from "@grpc/grpc-js"
import { ChatMessage, ConsoleCommand, ConsoleLog, Empty, PlayerList } from "../src/generated/proto/dipix-bot_pb";
import { EventEmitter } from "events";

let server = new Server()
let ee = new EventEmitter()
let StatsServer: IStatsServer = {
	getPlayers: (call: ServerUnaryCall<Empty, PlayerList>, callback: sendUnaryData<PlayerList>) => {
		console.log("[STATS SERVER] getPlayers call...")
		callback(null, new PlayerList().setPlayersList(["a", "b", "c"]))
	},
	pingServer: (call: ServerUnaryCall<Empty, Empty>, callback: sendUnaryData<Empty>) => {
		callback(null, new Empty())
	}
}
let ChatMessageServer: IChatMessageServiceServer = {
	connectChat: (call: ServerWritableStream<Empty, ChatMessage>) => {
		console.log("Opened BidiStream (Chat)")
		ee.on("msg", (msg: ChatMessage) => {
			console.log(`[ChatMessage] (${msg.getSender()}): '${msg.getContent()}'`)
			call.write(new ChatMessage().setSender("server").setContent(`Date: ${new Date().toString()}; Rnd: ${Math.random()}`))
		})
	},
	connectConsole: (call: ServerWritableStream<Empty, ConsoleLog>) => {
		console.log("Opened BidiStream (Console)")
		ee.on("cmd", (cmd: ConsoleCommand) => {
			console.log(`/${cmd.getCmd()} issued remotely.`)
			call.write(new ConsoleLog().setRaw(`/${cmd.getCmd()} issued remotely.`))
		})
	},
	sendCommand: (call: ServerUnaryCall<ConsoleCommand, Empty>, callback: sendUnaryData<Empty>) => {
		let cmd = call.request
		ee.emit("cmd", cmd)
		callback(null, new Empty())
	},
	sendMessage: (call: ServerUnaryCall<ChatMessage, Empty>, callback: sendUnaryData<Empty>) => {
		let msg = call.request
		ee.emit("msg", msg)
		callback(null, new Empty())
	}
}
server.addService(StatsService, StatsServer)
server.addService(ChatMessageServiceService, ChatMessageServer)
server.bindAsync('0.0.0.0:12608', ServerCredentials.createInsecure(), () => {
	server.start()
	console.log("Started server on port 12608")
})
