import { Plan, Promo } from "@prisma/client"
import { PlanDetail } from "../../../../types/PlanDetail"
import plans from "../../../../../plans"

export function getPlanDetail(plan: Plan): PlanDetail {
	let res = plans.filter(p => p.plan == plan)[0]
	if (!res) throw new Error("Undefined plan.")
	return res
}

export function getName(plan: Plan) {
	return getPlanDetail(plan).name
}

export function getCost(plan: Plan, promo?: Promo) {
	return getPlanDetail(plan).cost * (100 - (promo?.discount || 0))/100
} 
