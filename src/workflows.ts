// @@@SNIPSTART subscription-ts-workflow-definition
import {
  proxyActivities,
  log,
  defineSignal,
  defineQuery,
  setHandler,
  condition,
  workflowInfo,
} from "@temporalio/workflow";
import type * as activities from "./activities";
import { Customer } from "./shared";

const {
  sendWelcomeEmail,
  sendCancellationEmailDuringActiveSubscription,
  chargeCustomerForBillingPeriod,
  sendCancellationEmailDuringTrialPeriod,
  sendSubscriptionOverEmail,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: "5 seconds",
});

export const cancelSubscription = defineSignal("cancelSubscription");
export const customerIdNameQuery = defineQuery<string>("customerIdName");
export const billingPeriodNumberQuery = defineQuery<number>(
  "billingPeriodNumber"
);
export const updateBillingChargeAmount = defineSignal<[number]>(
  "updateBillingChargeAmount"
);
export const billingPeriodChargeAmountQuery = defineQuery<number>(
  "billingPeriodChargeAmount"
);

export async function subscriptionWorkflow(
  customer: Customer
): Promise<string> {
  let subscriptionCancelled = false;
  let totalCharged = 0;
  let billingPeriodNumber = 0;
  let billingPeriodChargeAmount =
    customer.subscription.initialBillingPeriodCharge; // Initialize billing period charge amount

  setHandler(customerIdNameQuery, () => customer.id);
  setHandler(cancelSubscription, () => {
    subscriptionCancelled = true;
  });
  setHandler(updateBillingChargeAmount, (newAmount: number) => {
    billingPeriodChargeAmount = newAmount;
    log.info(
      `Updating BillingPeriodChargeAmount to ${billingPeriodChargeAmount}`
    );
  });
  setHandler(billingPeriodNumberQuery, () => billingPeriodNumber);
  setHandler(billingPeriodChargeAmountQuery, () => billingPeriodChargeAmount);

  // Send welcome email to customer
  await sendWelcomeEmail(customer);

  // Used to wait for a the subscription to be cancelled or for a trial period timeout to elapse
  if (
    await condition(
      () => subscriptionCancelled,
      customer.subscription.trialPeriod
    )
  ) {
    await sendCancellationEmailDuringTrialPeriod(customer);
    // We have completed subscription for this customer. Finishing workflow execution
    return `Subscription finished for: ${customer.id}`;
  } else {
    // Trial period is over, start billing until we reach the max billing periods for the subscription or subscription has been cancelled
    while (true) {
      if (billingPeriodNumber >= customer.subscription.maxBillingPeriods) break;

      // Update billing period charge amount
      billingPeriodChargeAmount =
        customer.subscription.initialBillingPeriodCharge +
        billingPeriodNumber * 10; // Example increment logic

      log.info(`Charging ${customer.id} amount ${billingPeriodChargeAmount}`);

      await chargeCustomerForBillingPeriod(customer, billingPeriodChargeAmount);
      totalCharged += billingPeriodChargeAmount;

      // Wait 1 billing period to charge customer or if they cancel subscription, whichever comes first
      if (
        await condition(
          () => subscriptionCancelled,
          customer.subscription.billingPeriod
        )
      ) {
        // If customer cancelled their subscription, send notification email
        await sendCancellationEmailDuringActiveSubscription(customer);
        return `Subscription finished for: ${customer.id}`;
      }

      billingPeriodNumber++;
    }

    // If we get here the subscription period is over, notify the customer to buy a new subscription
    if (!subscriptionCancelled) {
      await sendSubscriptionOverEmail(customer);
    }
    return `Completed ${
      workflowInfo().workflowId
    }, Total Charged: ${totalCharged}`;
  }
}
// @@@SNIPEND
