import { Plan } from "@prisma/client"

export type PlanDetail = {
	plan: Plan,
	cost: number,
	duration: number,
	name: string
}
