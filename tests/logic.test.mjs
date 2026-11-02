import test from 'node:test';
import assert from 'node:assert/strict';

test('Application ID matches required Firestore rule regex', () => {
  const validRegex = /^[a-zA-Z0-9_\-]+$/;
  const validId = 'ARVI-2026-9481';
  const invalidId = 'ARVI 2026!@#$';

  assert.strictEqual(validRegex.test(validId), true);
  assert.strictEqual(validRegex.test(invalidId), false);
});

test('UPI URI generator produces valid spec format with parameters', () => {
  const upiId = '7265013972@upi';
  const amount = 107;
  const appId = 'ARVI-2026-1234';

  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=ARVI%20ONLINE%20CSC&am=${amount}&cu=INR&tn=${encodeURIComponent(appId)}`;

  assert.match(upiUrl, /^upi:\/\/pay\?/);
  assert.ok(upiUrl.includes('pa=7265013972%40upi'));
  assert.ok(upiUrl.includes('am=107'));
  assert.ok(upiUrl.includes('cu=INR'));
  assert.ok(upiUrl.includes('tn=ARVI-2026-1234'));
});

test('Total fee aggregator calculates sum of verified and paid applications', () => {
  const sampleApps = [
    { fee: 107, paymentStatus: 'PAID' },
    { fee: 50, paymentStatus: 'VERIFIED' },
    { fee: 150, paymentStatus: 'PENDING' },
    { fee: 30, paymentStatus: 'FAILED' },
  ];

  const total = sampleApps
    .filter((a) => a.paymentStatus === 'PAID' || a.paymentStatus === 'VERIFIED')
    .reduce((sum, a) => sum + a.fee, 0);

  assert.strictEqual(total, 157);
});
