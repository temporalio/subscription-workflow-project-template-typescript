import { MockActivityEnvironment } from '@temporalio/testing';
import { describe, it } from 'mocha';
import * as activities from '../activities';
import assert from 'assert';
import { Customer } from '../shared';

describe('Subscription Activities', () => {
  const customer: Customer = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    subscription: {
      trialPeriod: 30,
      billingPeriod: 30,
      maxBillingPeriods: 12,
      initialBillingPeriodCharge: 100,
    },
    id: 'customer-id-123',
  };

  it('successfully sends welcome email', async () => {
    const env = new MockActivityEnvironment();
    const result = await env.run(activities.sendWelcomeEmail, customer);
    assert.equal(result, undefined); // No return value, just log
  });

  it('successfully sends trial cancellation email', async () => {
    const env = new MockActivityEnvironment();
    const result = await env.run(activities.sendCancellationEmailDuringTrialPeriod, customer);
    assert.equal(result, undefined); // No return value, just log
  });

  it('successfully charges customer for billing period', async () => {
    const env = new MockActivityEnvironment();
    const result = await env.run(activities.chargeCustomerForBillingPeriod, customer, 150);
    assert.equal(result, undefined); // No return value, just log
  });

  it('successfully sends active subscription cancellation email', async () => {
    const env = new MockActivityEnvironment();
    const result = await env.run(activities.sendCancellationEmailDuringActiveSubscription, customer);
    assert.equal(result, undefined); // No return value, just log
  });

  it('successfully sends subscription over email', async () => {
    const env = new MockActivityEnvironment();
    const result = await env.run(activities.sendSubscriptionOverEmail, customer);
    assert.equal(result, undefined); // No return value, just log
  });
});