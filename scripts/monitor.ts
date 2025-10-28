/**
 * Monitor script to check proposals and auto-execute when ready
 * Run with: npx ts-node scripts/monitor.ts
 */

import { agentExecutor } from '../lib/agent';

const MONITOR_INTERVAL_MS = 60000; // Check every 60 seconds

async function monitor() {
  console.log('🤖 CrowdMind Agent Monitor Started');
  console.log(`Checking proposals every ${MONITOR_INTERVAL_MS / 1000} seconds...`);

  setInterval(async () => {
    try {
      console.log('\n⏰', new Date().toLocaleString());
      await agentExecutor.monitorAndExecute();
    } catch (error) {
      console.error('Error in monitor loop:', error);
    }
  }, MONITOR_INTERVAL_MS);

  // Run immediately on start
  await agentExecutor.monitorAndExecute();
}

monitor().catch((error) => {
  console.error('Fatal error in monitor:', error);
  process.exit(1);
});

