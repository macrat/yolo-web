import { createSpawner } from "./spawner/index.js";

const spawnCmd = process.env.SPAWNER_SPAWN_CMD || undefined;
const maxConcurrent = process.env.SPAWNER_MAX_CONCURRENT
  ? parseInt(process.env.SPAWNER_MAX_CONCURRENT, 10)
  : undefined;

const spawner = createSpawner({ spawnCmd, maxConcurrent });

// SIGINT handling: track timestamps for force-kill detection
const sigintTimestamps: number[] = [];

process.on("SIGINT", () => {
  const now = Date.now();
  sigintTimestamps.push(now);

  // Remove timestamps older than 1 second
  while (sigintTimestamps.length > 0 && now - sigintTimestamps[0] > 1000) {
    sigintTimestamps.shift();
  }

  // 3 or more SIGINT within 1 second = force kill
  if (sigintTimestamps.length >= 3) {
    spawner.forceKill();
    return;
  }

  // First/second SIGINT = enter ending mode
  spawner.enterEndingMode();
});

// Start the spawner
spawner.start();
