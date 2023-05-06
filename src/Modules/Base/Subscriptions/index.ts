import App from "../../../App";
import AppBusModuleComponent from "../../../types/AppBus/ModuleComponent";
import Logger from "../../../types/Logger";
import ModuleBuilder, { Module } from "../../../types/Module";
import scheduler from "./scheduler";

export default new ModuleBuilder("subscriptions", (module: Module) => {
	
	scheduler(module.app, module.logger)

	return module
})
