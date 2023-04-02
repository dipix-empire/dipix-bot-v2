import App from "../../../App";
import Logger from "../../../types/Logger";
import { Axios } from "axios";
import pingOutBot from "./pingOutBot";
import expiringSubs from "./expiringSubs";
import expiredSubs from "./expiredSubs";

export default (app: App, logger: Logger) => {
	let paymentBot = new Axios({
		headers: {
			Token: "123",
			"content-type": 'application/x-www-form-urlencoded'
		},
		baseURL: "http://localhost:4000"
	})
	let pingBot = pingOutBot(paymentBot)
	let subReminder = expiringSubs(app, paymentBot)
	let subRenewal = expiredSubs(app, paymentBot)
	subReminder.schedule(app.config.modules.payments.updateTimes.reminder, logger)
	subRenewal.schedule(app.config.modules.payments.updateTimes.renewal, logger)
	pingBot.schedule(app.config.modules.payments.updateTimes.ping, logger)
}
