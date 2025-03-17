// Force puppeteer to store everything to /tmp/
process.env.HOME = "/tmp";

const { delay, handleTargetCreated, handleTargetDestroyed, logMainInfo, logMainError } = require("./utils");
const puppeteer = require("puppeteer");

// Banner
const tips = ["Every console.log usage on the bot will be sent back to you :)"];
console.log(`==========\nTips: ${tips[Math.floor(Math.random() * tips.length)]}\n==========`);

// Spawn the bot and navigate to the user provided link
async function goto(url) {
	logMainInfo("Starting the browser...");
	const browser = await puppeteer.launch({
		headless: "new",
		ignoreHTTPSErrors: true,
		args: [
			"--no-sandbox",
			"--disable-gpu",
			"--disable-jit",
			"--disable-wasm",
			"--disable-dev-shm-usage"
		],
		executablePath: "/usr/bin/chromium-browser"
	});

	// Hook tabs events
	browser.on("targetcreated", handleTargetCreated.bind(browser));
	browser.on("targetdestroyed", handleTargetDestroyed.bind(browser));

	/* ** CHALLENGE LOGIC ** */
	const page = await browser.newPage();
	await page.setDefaultNavigationTimeout(5000);

	logMainInfo("XXX...");
	// UPDATE HERE

	logMainInfo("Going to the user provided link...");
	try { await page.goto(url) } catch {}
	await delay(5000);

	logMainInfo("Leaving o/");
	await browser.close();
	return;
}

// Handle TCP data
process.stdin.on("data", (data) => {
	const url = data.toString().trim();

	if (!url || !(url.startsWith("http://") || url.startsWith("https://"))) {
		console.log("[ERROR] Invalid URL!");
		process.exit(1);
	}

	goto(url)
	.then(() => process.exit(0))
	.catch((error) => {
		if (process.env.ENVIRONMENT === "development") {
			console.error(error);
		}
		process.exit(1);
	});
});