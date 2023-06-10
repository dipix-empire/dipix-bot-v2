export async function Sleep(time: number) {
	return new Promise<void>((resolve, reject) => {
		setTimeout(resolve, time)
	})
}
