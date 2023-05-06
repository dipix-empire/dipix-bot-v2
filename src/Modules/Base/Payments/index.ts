import App from "../../../App";
import AppBusModuleComponent from "../../../types/AppBus/ModuleComponent";
import Logger from "../../../types/Logger";
import ModuleBuilder, { Module } from "../../../types/Module";
import donate from "./donate";
import manage from "./manage";
import profile from "./profile";
import promoManager from "./promo";

export default new ModuleBuilder(
	"payments",
	(module: Module) => {
		module.addEvent(
			profile(module.app, module.logger), 
			donate(module.app, module.logger),
			...manage(module.app, module.logger),
			...promoManager(module.app, module.logger)
		)
		return module
	}
)
