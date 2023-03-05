import { ChatMessageServiceService, IChatMessageServiceServer, IStatsServer, StatsService } from "../src/generated/proto/dipix-bot_grpc_pb";
import { Server, ServerCredentials, ServerDuplexStream, ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js"
import { ChatMessage, ConsoleCommand, ConsoleLog, Empty, PlayerList } from "../src/generated/proto/dipix-bot_pb";

let server = new Server()
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
	connectChat: (call: ServerDuplexStream<ChatMessage, ChatMessage>) => {
		console.log("Opened BidiStream (Chat)")
		call.on("data", (msg: ChatMessage) => {
			console.log(`[ChatMessage] (${msg.getSender()}): '${msg.getContent()}'`)
			call.write(new ChatMessage().setSender("server").setContent(`Date: ${new Date().toString()}; Rnd: ${Math.random()}`))
		})
		call.on("close", call.end)
	},
	connectConsole: (call: ServerDuplexStream<ConsoleCommand, ConsoleLog>) => {
		console.log("Opened BidiStream (Console)")
		call.on("data", (cmd: ConsoleCommand) => {
			console.log(`/${cmd.getCmd()} issued remotely.`)
			call.write(new ConsoleLog().setContent(`/${cmd.getCmd()} issued remotely.`))
		})
		call.on("close", call.end)
	}
}
server.addService(StatsService, StatsServer)
server.addService(ChatMessageServiceService, ChatMessageServer)
server.bindAsync('0.0.0.0:12608', ServerCredentials.createInsecure(), () => {
	server.start()
	console.log("Started server on port 12608")
})
