import path from "node:path";
import { $ } from "zx";

type PackageOutput = {
	name: string;
	path: string;
	version?: string;
};

const baseDir = path.join(import.meta.dirname, "../..");
const zx = $({ cwd: baseDir, nothrow: true });

const getPackageDir = async (packageName: string) => {
	const packages = (await zx`pnpm m ls --json --depth=-1`).json<
		PackageOutput[]
	>();
	const matchedPackage = packages.find(({ name }) => name === packageName);
	if (!matchedPackage) {
		throw new Error(`Package name "${packageName}" not found!`);
	}
	return `./${path.relative(baseDir, matchedPackage.path)}`;
};

const getDockerPrefix = () => {
	if (!process.env.DOCKER_PREFIX) {
		throw new Error(`Expected to have DOCKER_PREFIX in env variable`);
	}
	return process.env.DOCKER_PREFIX;
};

const getDockerfilePath = async (packageDir: string) => {
	const filepath = `${packageDir}/Dockerfile`;
	const result = await zx`stat ${filepath}`;
	if (result.exitCode === 1) {
		throw new Error(`Expected to have file at ${filepath}`);
	}
	return filepath;
};

const getPackageVersion = async (packageDir: string) => {
	const packageJsonPath = `${packageDir}/package.json`;
	const versionResult = await zx`cat ${packageJsonPath} | jq -e ".version"`;
	if (versionResult.exitCode === 1) {
		throw new Error(`Expected to have "version" prop in ${packageJsonPath}`);
	}
	return JSON.parse(versionResult.stdout) as string;
};

const getDockerImageName = async (packageDir: string) => {
	const packageJsonPath = `${packageDir}/package.json`;
	const dockerImageNameResult =
		await zx`cat ${packageJsonPath} | jq -e ".dockerImage"`;
	if (dockerImageNameResult.exitCode === 1) {
		throw new Error(
			`Expected to have "dockerImage" prop in ${packageJsonPath}`,
		);
	}
	return JSON.parse(dockerImageNameResult.stdout) as string;
};

export const buildDocker = async (buildPackageName: string) => {
	console.log(`[[ Building docker image "${buildPackageName}" ]]`);
	const relativePackageDir = await getPackageDir(buildPackageName);
	const dockerfile = await getDockerfilePath(relativePackageDir);
	const dockerImage = await getDockerImageName(relativePackageDir);
	const buildOutput =
		await zx`docker build -f ${dockerfile} -t ${dockerImage} .`.pipe(
			process.stdout,
		);
	const hash =
		buildOutput.exitCode === 0
			? /image sha256:(.*) done/.exec(buildOutput.text())?.[1]
			: undefined;
	console.log(
		`[[ Docker image "${buildPackageName}" built, sha "${hash ?? "unknown"}" ]]`,
	);
};

export const publishDocker = async (buildPackageName: string) => {
	console.log(`[[ Publishing docker image "${buildPackageName}" ]]`);
	const relativePackageDir = await getPackageDir(buildPackageName);
	const dockerImage = await getDockerImageName(relativePackageDir);
	const packageVersion = await getPackageVersion(relativePackageDir);
	const dockerPrefix = getDockerPrefix();
	const tag = `${dockerPrefix}/${dockerImage}:${packageVersion}`;
	await zx`docker tag ${dockerImage}:latest ${tag}`.pipe(process.stdout);
	console.log(`[[ Docker image "${buildPackageName}" tagged as ${tag} ]]`);
	await zx`docker push ${tag}`.pipe(process.stdout);
	console.log(`[[ Docker image "${buildPackageName}" pushed as ${tag} ]]`);
};

export const main = async (...[, , command, ...rest]: string[]) => {
	const buildPackageName = rest[0] ?? "";
	switch (command) {
		case "build":
			return buildDocker(buildPackageName);
		case "publish":
			return publishDocker(buildPackageName);
		default:
			throw new Error(`Command ${command} is not implemented yet!`);
	}
};

await main(...process.argv);
