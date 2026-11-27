import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';

const flavours = {
  dev: { script: 'native:dev', task: 'installDevDebug' },
  qa: { script: 'native:qa', task: 'installQaDebug' },
  prod: { script: 'native:prod', task: 'installProdDebug' },
};

const flavour = flavours[process.argv[2]];
if (!flavour) {
  console.error('Usage: node scripts/native-install.mjs <dev|qa|prod>');
  process.exit(1);
}

const isWindows = process.platform === 'win32';
const sdk = process.env.ANDROID_HOME ?? process.env.ANDROID_SDK_ROOT ?? join(process.env.LOCALAPPDATA ?? '', 'Android', 'Sdk');
const adb = join(sdk, 'platform-tools', isWindows ? 'adb.exe' : 'adb');
const emulator = join(sdk, 'emulator', isWindows ? 'emulator.exe' : 'emulator');

const run = (file, args) => execFileSync(file, args, { encoding: 'utf8' });

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const readTargets = () => {
  let output;
  try {
    output = run(adb, ['devices', '-l']);
  } catch (error) {
    fail(`Could not run adb at ${adb}: ${error.message}`);
  }
  return output
    .split(/\r?\n/)
    .slice(1)
    .map((line) => /^(\S+)\s+device\b(.*)$/.exec(line))
    .filter(Boolean)
    .map(([, serial, details]) => {
      const model = /model:(\S+)/.exec(details)?.[1] ?? serial;
      const emulatorTarget = serial.startsWith('emulator-');
      return { serial, emulatorTarget, label: `${model} [${serial}]${emulatorTarget ? ' (emulator, running)' : ' (device)'}` };
    });
};

const listAvds = () => {
  try {
    return run(emulator, ['-list-avds']).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  } catch {
    return [];
  }
};

const avdNameOf = (serial) => {
  try {
    return run(adb, ['-s', serial, 'emu', 'avd', 'name']).split(/\r?\n/)[0].trim();
  } catch {
    return undefined;
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const startEmulator = async (avdName, knownSerials) => {
  console.log(`Starting emulator "${avdName}"...`);
  spawn(emulator, ['-avd', avdName], { detached: true, stdio: 'ignore' }).unref();

  const deadline = Date.now() + 240_000;
  let serial;
  while (!serial) {
    if (Date.now() > deadline) fail(`Emulator "${avdName}" did not appear in adb within 4 minutes.`);
    await sleep(2000);
    serial = readTargets().find((t) => t.emulatorTarget && !knownSerials.includes(t.serial))?.serial;
  }

  while (run(adb, ['-s', serial, 'shell', 'getprop', 'sys.boot_completed']).trim() !== '1') {
    if (Date.now() > deadline) fail(`Emulator "${avdName}" did not finish booting within 4 minutes.`);
    await sleep(2000);
  }
  console.log(`Emulator "${avdName}" is ready as ${serial}.`);
  return serial;
};

const chooseTarget = async () => {
  const targets = readTargets();
  const selected = process.env.ANDROID_SERIAL;

  if (selected) {
    const match = targets.find((t) => t.serial === selected);
    if (!match) fail(`ANDROID_SERIAL=${selected} is not ready. Ready targets: ${targets.map((t) => t.serial).join(', ') || 'none'}.`);
    return match.serial;
  }

  const runningAvds = new Set(targets.filter((t) => t.emulatorTarget).map((t) => avdNameOf(t.serial)));
  const options = [
    ...targets.map((t) => ({ label: t.label, serial: t.serial })),
    ...listAvds()
      .filter((name) => !runningAvds.has(name))
      .map((name) => ({ label: `${name} (emulator, not running - will start)`, avd: name })),
  ];

  if (options.length === 0) {
    fail('No device or emulator found. Connect the phone over USB with USB debugging on and accept the prompt, or create an emulator in Android Studio Device Manager, then retry.');
  }

  if (!process.stdin.isTTY) {
    if (options.length === 1) return options[0].serial ?? (await startEmulator(options[0].avd, targets.map((t) => t.serial)));
    fail(`Several targets are available and no terminal is attached to pick one. Set ANDROID_SERIAL to one of: ${targets.map((t) => t.serial).join(', ') || 'none running'}.`);
  }

  console.log('Connected devices and emulators:');
  options.forEach((option, index) => console.log(`  ${index + 1}) ${option.label}`));

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`Install on which one? [1-${options.length}]: `);
  rl.close();

  const choice = options[Number(answer) - 1];
  if (!choice) fail(`"${answer}" is not one of the options.`);
  return choice.serial ?? (await startEmulator(choice.avd, targets.map((t) => t.serial)));
};

const serial = await chooseTarget();
const env = { ...process.env, ANDROID_SERIAL: serial };
console.log(`Installing ${flavour.task} on ${serial}.`);

const build = spawnSync('npm', ['run', flavour.script], { stdio: 'inherit', shell: true, env });
if (build.status !== 0) process.exit(build.status ?? 1);

// Full path: cmd.exe does not always search the working directory (NoDefaultCurrentDirectoryInExePath).
const androidDir = join(process.cwd(), 'android');
const install = spawnSync(`"${join(androidDir, isWindows ? 'gradlew.bat' : 'gradlew')}"`, [flavour.task], {
  cwd: androidDir,
  stdio: 'inherit',
  shell: true,
  env,
});
process.exit(install.status ?? 1);
