type ExpressHandler = (req: any, res: any) => any;

let cachedApp: ExpressHandler | null = null;

export default async function handler(req: any, res: any) {
	try {
		if (!cachedApp) {
			const mod = await import("../src/app");
			cachedApp = mod.default as ExpressHandler;
		}

		return cachedApp(req, res);
	} catch (error) {
		console.error("Function initialization failed:", error);
		const message = error instanceof Error ? error.message : "Unknown error";

		return res.status(500).json({
			success: false,
			message: "Server initialization failed",
			error: message,
		});
	}
}
