export function getDate(date: Date, { gap = 0, end = false }: { gap?: number, end?: boolean } = {}) {
	let time = !end ? [0,0,0,0] : [ 23, 59, 59, 999 ]
	return new Date(date.getFullYear(), date.getMonth(), date.getDate() + gap, ...time)
}
export let updateRange = 1000 * 60
