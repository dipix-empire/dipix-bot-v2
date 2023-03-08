import App from "./src/App";
import config from "./config"
import secrets from "./secrets";
import Modules from "./src/Modules";

(async () => {
	let app = await new App(config, secrets, Modules).start()
	process.on("exit", async () => {
		try {
			await app.stop()
			console.log("Bye")
		} catch (err) {
			process.exitCode = 1
			console.error(err)
		} finally {
			process.exit()
		}
	})
})()
