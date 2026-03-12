/**
 * Royal Mafia API Latency Benchmark
 *
 * Usage:
 *   1. Start dev server: npm run dev
 *   2. In a separate terminal: node scripts/bench.js
 *
 * Run this BEFORE and AFTER caching changes to compare.
 */

const BASE_URL = 'http://localhost:3000';
const RUNS = 10;

function avg(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

async function measure(label, fn) {
  const times = [];
  for (let i = 0; i < RUNS; i++) {
    const start = performance.now();
    const res = await fn();
    times.push(performance.now() - start);
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.warn(`  [run ${i + 1}] HTTP ${res.status}: ${body.slice(0, 120)}`);
    }
  }
  const a = avg(times);
  const mn = Math.min(...times);
  const mx = Math.max(...times);
  console.log(
    `  ${label.padEnd(38)} avg=${a.toFixed(1).padStart(6)}ms  min=${mn.toFixed(1).padStart(6)}ms  max=${mx.toFixed(1).padStart(6)}ms`
  );
  return { avg: a, min: mn, max: mx };
}

async function run() {
  console.log(`\n${'='.repeat(72)}`);
  console.log(`  Royal Mafia API Latency Benchmark  (${RUNS} runs each)`);
  console.log(`  Target: ${BASE_URL}`);
  console.log(`${'='.repeat(72)}\n`);

  // ── Establish session ────────────────────────────────────────────────────
  console.log('  Establishing session...');
  const initRes = await fetch(`${BASE_URL}/api/cart`).catch(() => null);
  if (!initRes || !initRes.ok) {
    console.error(`\n  ERROR: Could not reach ${BASE_URL}/api/cart`);
    console.error('  Make sure the dev server is running (npm run dev)\n');
    process.exit(1);
  }

  // Capture session cookie so all requests share the same cart
  const setCookieHeader = initRes.headers.get('set-cookie') ?? '';
  const sessionCookie = setCookieHeader.split(';')[0]; // e.g. "session_id=abc123"
  const headers = sessionCookie ? { Cookie: sessionCookie } : {};
  console.log(`  Session: ${sessionCookie || '(using existing cookie)'}\n`);

  // ── GET /api/cart ────────────────────────────────────────────────────────
  console.log('GET /api/cart');
  await measure('cold (first call after session init)', () =>
    fetch(`${BASE_URL}/api/cart`, { headers })
  );
  await measure('warm (subsequent calls)',              () =>
    fetch(`${BASE_URL}/api/cart`, { headers })
  );

  // ── POST /api/cart/add ───────────────────────────────────────────────────
  console.log('\nPOST /api/cart/add');
  await measure('add item (+1)',  () =>
    fetch(`${BASE_URL}/api/cart/add`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: '1', quantityDelta: 1 }),
    })
  );

  // Clean up: remove all added items so cart is left empty
  await fetch(`${BASE_URL}/api/cart/add`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: '1', quantityDelta: -RUNS }),
  });

  await measure('remove item (-1)', () =>
    fetch(`${BASE_URL}/api/cart/add`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: '1', quantityDelta: -1 }),
    })
  );

  console.log('\n' + '='.repeat(72));
  console.log('  Done. Compare these numbers before/after adding caching.');
  console.log('  Key metric: "GET /api/cart warm" should drop to ~0ms after');
  console.log('  the staleness guard is active (cart sidebar opened twice).');
  console.log('='.repeat(72) + '\n');
}

run().catch(err => {
  console.error('\nUnexpected error:', err.message);
  process.exit(1);
});
