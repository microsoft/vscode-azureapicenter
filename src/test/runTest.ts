import * as vstest from "@vscode/test-electron";
import * as cp from "child_process";
import * as fs from "fs-extra";
import * as path from 'path';
import * as semver from "semver";
let exitCode = 0;
const cwd = process.cwd();
const testEnv = Object.create(process.env) as NodeJS.Dict<string>;

async function runTests(testFolder: string, workspaceFolder: string, logSuffix?: string, env?: NodeJS.Dict<string>): Promise<void> {
	console.log(`Running ${testFolder} tests folder in workspace ${workspaceFolder}`);

	const logsName = process.env.LOGS_NAME || "test";
	const testRunName = `${testFolder.replace(/\//g, "_")}${logSuffix ? `_${logSuffix}` : ""}_${logsName}`;
	const logPath = path.join(cwd, ".code_test_logs", `${testRunName}`);

	testEnv.TEST_RUN_NAME = testRunName;
	testEnv.DC_TEST_LOGS = logPath;
	testEnv.COVERAGE_OUTPUT = path.join(cwd, ".nyc_output", `${testRunName}.json`);
	testEnv.TEST_XML_OUTPUT = path.join(path.join(cwd, ".test_results"), `${testRunName}.xml`);

	if (!fs.existsSync(logPath)) {
		fs.mkdirSync(logPath);
	}

	const packageContent = await fs.readFile(path.join(__dirname, "..", "..", "..", "package.json"));
	const packageJSON = JSON.parse(packageContent.toString());
	let vscodeVersion = packageJSON.engines.vscode;
	vscodeVersion = semver.minVersion(vscodeVersion)!.version;
	console.log('Installation vscode version == ', vscodeVersion);
	// The VS Code download is often flaky on GH Actions, so we want to retry
	// if required - however we don't want to re-run tests if they fail, so do
	// the download step separately.
	let currentAttempt = 1;
	const maxAttempts = 5;
	while (currentAttempt <= maxAttempts) {
		try {
			console.log(`Attempting to download VS Code attempt #${currentAttempt}`);

			const vscodeExecutablePath = await vstest.downloadAndUnzipVSCode(vscodeVersion);
			const [cliPath, ...args] = vstest.resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);
			console.log('preinstall azure-account extension');
			cp.spawnSync(cliPath,
				[...args, '--install-extension', 'ms-vscode.azure-account'], {
				encoding: 'utf-8',
				stdio: 'inherit'
			});
			break;
		} catch (e) {
			if (currentAttempt >= maxAttempts) {
				throw e;
			}

			console.warn(`Failed to download VS Code, will retry: ${e}`);
			currentAttempt++;
		}
	}

	try {
		const res = await vstest.runTests({
			extensionDevelopmentPath: cwd,
			extensionTestsEnv: { ...testEnv, ...env },
			extensionTestsPath: path.join(cwd, "out", "src", "test", testFolder),
			launchArgs: [
				path.isAbsolute(workspaceFolder)
					? workspaceFolder
					: path.join(cwd, "src", "test", "test_projects", workspaceFolder),
				"--profile-temp",
				"--crash-reporter-directory",
				path.join(cwd, ".crash_dumps", testFolder),
				// Disable the Git extensions as these may be causing test failures on GitHub Actions:
				// https://github.com/Dart-Code/Dart-Code/runs/2297610200?check_suite_focus=true#step:23:121
				"--disable-extension",
				"vscode.git",
				"--disable-extension",
				"vscode.git-ui",
				"--disable-extension",
				"vscode.github",
				"--disable-extension",
				"vscode.github-authentication",
				"--disable-workspace-trust",
			],
			version: vscodeVersion,
		});
		exitCode = exitCode || res;
	} catch (e) {
		console.error(e);
		exitCode = exitCode || 999;
	}

	console.log("############################################################");
	console.log("\n\n");
}
async function runAllTests(): Promise<void> {
	testEnv.DART_CODE_IS_TEST_RUN = "true";
	testEnv.MOCHA_FORBID_ONLY = "true";

	// Ensure any necessary folders exist.
	if (!fs.existsSync(".code_test_logs")) {
		fs.mkdirSync(".code_test_logs");
	}

	try {
		await runTests("commands", "test_commands");
	} catch (e) {
		exitCode = 1;
		console.error(e);
	}
}
void runAllTests().then(() => process.exit(exitCode));
