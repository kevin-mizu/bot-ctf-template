// Colors
const bold      = (str) => `\x1b[1m${str}\x1b[0m`;
const underline = (str) => `\x1b[4m${str}\x1b[0m`;
const red       = (str) => `\x1b[31m${str}\x1b[0m`;
const green     = (str) => `\x1b[32m${str}\x1b[0m`;
const yellow    = (str) => `\x1b[33m${str}\x1b[0m`;
const blue      = (str) => `\x1b[34m${str}\x1b[0m`;
const gray      = (str) => `\x1b[2m${str}\x1b[0m`;
const nothing   = (str) => str;
const getConsoleColor = { "log": green, "warn": yellow, "error": red }

const logMainInfo = (str) => console.log("\n" + underline(str));
const logMainError = (str) => console.log("\n" + underline(red(str)));

const delay = (time) => {
	return new Promise(resolve => setTimeout(resolve, time));
}

const hookPageEvents = async function (page, id) {
	page.on("console", (msg) => {
		var msgType = msg.type();
		var color   = getConsoleColor[msgType] || nothing;
		console.log(`${bold(`[T${id}]>`)} ${color(`console.${msgType}`.padEnd(17))} ${bold("|")} ${msg.text()}`);
	});

	page.on("framenavigated", (frame) => {
		if (frame === page.mainFrame()) {
			console.log(`${bold(`[T${id}]>`)} ${blue("navigating".padEnd(17))} ${bold("|")} ${frame.url()}`);
		}
	});
}

// Workaround of https://github.com/puppeteer/puppeteer/blob/237cb42b34fca582a69386a610e185159564a43f/packages/puppeteer-core/src/cdp/Target.ts#L299
// Thanks @Drarig29: https://stackoverflow.com/questions/73407885/how-can-i-forward-service-worker-console-logs-to-stdout-in-the-terminal
const hookWorkerEvents = async function (worker, id) {
	worker.client.on("Runtime.consoleAPICalled", (args) => {
		var msgType = args.type;
		var color   = getConsoleColor[msgType] || nothing;
		console.log(`${bold(`[S${id}]>`)} ${color(`console.${msgType}`.padEnd(17))} ${bold("|")} ${args.args[0].value}`);
	});
}

let tabs = [];
let nbSW = 0;
const handleTargetCreated = async function (target) {
	if (target.type() === "page") {
		if (tabs.length > 5) { // pages[0] doesn't count since it's not being used.
			logMainError("You can't open more than 5 tabs!");
			await this.close();
			process.exit(1);
		}
		tabs.push(target._targetId);
		console.log(`${bold(`[T${tabs.length}]>`)} ${gray("New tab created!")}`);
		const page = await target.page();
		console.log(`${bold(`[T${tabs.length}]>`)} ${blue("navigating".padEnd(17))} ${bold("|")} ${page.url()}`);
		await hookPageEvents(page, tabs.length);

	// Service workers but not only, extension's v3 background script also uses sw.
	} else if (target.type() === "service_worker") {
		nbSW++
		console.log(`${bold(`[S${nbSW}]>`)} ${gray("New Service Worker created!")}`);
		const worker = await target.worker();
		await hookWorkerEvents(worker, nbSW);

	// Extension's side panel spawn as "other".
	} else if (target.type() === "other") {
		const client = await target.createCDPSession(); // No choice for that type, creating a CDP session is required.
		await client.send("Runtime.enable");
		const info = await client.send("Target.getTargetInfo", { targetId: target._targetId });

		if (info?.targetInfo?.url?.startsWith("chrome-extension://")) {
			console.log(`${bold(`[E${other.length+1}]>`)} ${gray("New extension page created!")}`);
		} else {
			// Don't handle other yet. For the moment only extension's related pages are handled here.
			return;
		}

		other.push(target._targetId);
		const targetId = other.length;
		console.log(`${bold(`[E${targetId}]>`)} ${blue("navigating".padEnd(17))} ${bold("|")} ${info.targetInfo.url}`);

		client.on("Runtime.consoleAPICalled", (event) => {
			const { type, args } = event;
			const color = getConsoleColor[type] || nothing;
			const message = args.map(arg => arg.value || arg.description || "").join(" ");
			console.log(`${bold(`[E${targetId}]>`)} ${color(`console.${type}`.padEnd(17))} ${bold("|")} ${message}`);
		});
	}
}

const handleTargetDestroyed = async function (target) {
	if (target.type() === "page") {
		console.log(`${bold(`[T${tabs.indexOf(target._targetId)+1}]>`)} ${gray("Tab closed!")}`);
	}
}

module.exports = {
	delay,
	handleTargetCreated,
	handleTargetDestroyed,
	logMainInfo,
	logMainError
}