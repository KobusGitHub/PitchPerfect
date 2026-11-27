// Signs a release APK or AAB for one environment. The environment picks the Gradle
// flavour, so the artifact carries that environment's App ID and launcher name.
// Usage: npm run sign-app [-- <dev|qa|prod> <apk|aab>]   (prompts when omitted)
// Keystore path and passwords are prompted; ANDROID_KEYSTORE_PATH, ANDROID_STORE_PASSWORD,
// ANDROID_KEY_ALIAS and ANDROID_KEY_PASSWORD pre-fill them. Nothing is written to git.
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const androidDir = path.join(rootDir, 'android');
const isWindows = process.platform === 'win32';

// Mirrors the productFlavors in android/app/build.gradle; envFile holds that flavour's APP_VERSION_* values.
const environments = {
  dev: { label: 'DEV', native: 'native:dev', flavour: 'dev', appId: 'net.crazysoftware.pitchperfect.dev', envFile: '.env.development' },
  qa: { label: 'QA', native: 'native:qa', flavour: 'qa', appId: 'net.crazysoftware.pitchperfect.qa', envFile: '.env.qa' },
  prod: { label: 'PROD', native: 'native:prod', flavour: 'prod', appId: 'net.crazysoftware.pitchperfect', envFile: '.env.production' },
};
const targets = ['apk', 'aab'];

function fail(message) {
  console.error(message);
  process.exit(1);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.error) fail(`Failed to run ${command}: ${result.error.message}`);
  if (result.status !== 0) fail(`${command} ${args.join(' ')} exited with code ${result.status}.`);
}

function sanitizeFilePart(value) {
  return value.trim().replace(/[<>:"/\\|?*]+/g, '_');
}

function readAppName() {
  const config = fs.readFileSync(path.join(rootDir, 'capacitor.config.ts'), 'utf8');
  const match = config.match(/appName:\s*['"]([^'"]+)['"]/);
  return match ? match[1] : 'App';
}

function readVersionName(envFile) {
  const env = fs.readFileSync(path.join(rootDir, envFile), 'utf8');
  const match = env.match(/^APP_VERSION_NAME=(.+)$/m);
  if (!match) fail(`APP_VERSION_NAME is missing from ${envFile}.`);
  return match[1].trim().replace(/\./g, '');
}

// Queues every input line, so answers piped in at once are not lost between prompts.
function createPrompter() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
  const queued = [];
  const waiting = [];
  let closed = false;
  rl.on('line', (line) => (waiting.length ? waiting.shift()(line) : queued.push(line)));
  rl.on('close', () => {
    closed = true;
    while (waiting.length) waiting.shift()(null);
  });
  return {
    async question(prompt) {
      process.stdout.write(prompt);
      if (queued.length) return queued.shift();
      if (closed) return null;
      const line = await new Promise((resolve) => waiting.push(resolve));
      if (line === null) fail('\nInput ended before all answers were given.');
      return line;
    },
    close() {
      rl.close();
    },
  };
}

async function resolveArguments(rl, args) {
  let [env, target] = args.map((value) => value.toLowerCase());
  if (!environments[env]) {
    console.log('Select environment:');
    console.log('1) DEV');
    console.log('2) QA');
    console.log('3) PROD');
    const answer = ((await rl.question('Enter option (1, 2, or 3): ')) ?? '').trim();
    env = { 1: 'dev', 2: 'qa', 3: 'prod' }[answer];
    if (!env) fail('Invalid environment option. Please enter 1, 2, or 3.');
  }
  if (!targets.includes(target)) {
    console.log('Select output type:');
    console.log('1) APK');
    console.log('2) AAB');
    const answer = ((await rl.question('Enter option (1 or 2): ')) ?? '').trim();
    target = { 1: 'apk', 2: 'aab' }[answer];
    if (!target) fail('Invalid output option. Please enter 1 or 2.');
  }
  return { env, target };
}

async function askRequired(rl, question, preset) {
  const answer = (((await rl.question(question)) ?? '').trim() || preset || '').replace(/^"(.*)"$/, '$1');
  if (!answer) fail(`${question.replace(/:\s*$/, '')} is required.`);
  return answer;
}

async function resolveSigning(rl, label) {
  const keystorePath = path.resolve(
    await askRequired(rl, 'Path to the .jks keystore: ', process.env.ANDROID_KEYSTORE_PATH),
  );
  if (!keystorePath.toLowerCase().endsWith('.jks') || !fs.existsSync(keystorePath)) {
    fail(`Keystore not found or not a .jks file: ${keystorePath}`);
  }
  const storePassword = await askRequired(rl, `Keystore password for ${label}: `, process.env.ANDROID_STORE_PASSWORD);
  const keyAlias = await askRequired(rl, `Key alias for ${label}: `, process.env.ANDROID_KEY_ALIAS);
  const keyPassword = await askRequired(rl, `Key password for ${label}: `, process.env.ANDROID_KEY_PASSWORD);
  return { keystorePath, storePassword, keyAlias, keyPassword };
}

// Checks the credentials before a long build, and returns the SHA-256 fingerprint.
function verifyKeystore({ keystorePath, storePassword, keyAlias }) {
  const keytool = isWindows ? 'keytool.exe' : 'keytool';
  const result = spawnSync(
    keytool,
    ['-list', '-v', '-keystore', keystorePath, '-storepass', storePassword, '-alias', keyAlias],
    { encoding: 'utf8' },
  );
  if (result.error) fail(`Could not run keytool (is a JDK installed and on PATH?): ${result.error.message}`);
  if (result.status !== 0) fail('keytool could not open the keystore. Check the keystore password and key alias.');
  const match = `${result.stdout}\n${result.stderr}`.match(/SHA256:\s*([0-9A-F:]+)/i);
  return match ? match[1] : 'unknown';
}

function main() {
  const rl = createPrompter();
  (async () => {
    const { env, target } = await resolveArguments(rl, process.argv.slice(2));
    const environment = environments[env];
    const signing = await resolveSigning(rl, environment.label);
    rl.close();

    const fingerprint = verifyKeystore(signing);
    console.log(`Keystore OK. Alias: ${signing.keyAlias}, SHA-256: ${fingerprint}`);

    // Web build and cap sync for this environment, so the native project matches it.
    run(isWindows ? 'npm.cmd' : 'npm', ['run', environment.native], { cwd: rootDir, shell: isWindows });

    const gradleProperties = [
      `-Pandroid.injected.signing.store.file=${signing.keystorePath}`,
      `-Pandroid.injected.signing.store.password=${signing.storePassword}`,
      `-Pandroid.injected.signing.key.alias=${signing.keyAlias}`,
      `-Pandroid.injected.signing.key.password=${signing.keyPassword}`,
      '-Pandroid.injected.signing.v1.enabled=true',
      '-Pandroid.injected.signing.v2.enabled=true',
    ];
    const flavourCap = environment.flavour.charAt(0).toUpperCase() + environment.flavour.slice(1);
    const task = `:app:${target === 'apk' ? 'assemble' : 'bundle'}${flavourCap}Release`;
    // Calls the wrapper jar directly, so passwords go in as plain arguments, not through cmd.exe.
    const javaCommand = process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, 'bin', isWindows ? 'java.exe' : 'java') : 'java';
    const wrapperJar = path.join(androidDir, 'gradle', 'wrapper', 'gradle-wrapper.jar');
    run(javaCommand, ['-classpath', wrapperJar, 'org.gradle.wrapper.GradleWrapperMain', task, '--console=plain', ...gradleProperties], {
      cwd: androidDir,
    });

    const artifactName = `app-${environment.flavour}-release.${target}`;
    const artifactPath =
      target === 'apk'
        ? path.join(androidDir, 'app', 'build', 'outputs', 'apk', environment.flavour, 'release', artifactName)
        : path.join(androidDir, 'app', 'build', 'outputs', 'bundle', `${environment.flavour}Release`, artifactName);
    if (!fs.existsSync(artifactPath)) fail(`Expected artifact not found: ${artifactPath}`);

    const outputFolder = path.join(rootDir, 'signing', target.toUpperCase());
    const outputName = `${sanitizeFilePart(readAppName())}_${environment.label}_${readVersionName(environment.envFile)}.${target}`;
    const outputPath = path.join(outputFolder, outputName);
    fs.rmSync(outputPath, { force: true });
    fs.copyFileSync(artifactPath, outputPath);

    console.log(`Created: ${outputPath}`);
    console.log(`App ID: ${environment.appId}`);
    console.log(`Signed with alias ${signing.keyAlias}, SHA-256: ${fingerprint}`);
  })().catch((error) => fail(error.message));
}

main();
