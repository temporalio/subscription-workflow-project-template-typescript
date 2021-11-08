// @@@SNIPSTART subscription-ts-workflow-definition
import * as wf from "@temporalio/workflow";
import type * as activities from "./activities";
import { Customer } from "./types";

const {
  sendWelcomeEmail,
  sendCancellationEmailDuringTrialPeriod,
  chargeCustomerForBillingPeriod,
  sendCancellationEmailDuringActiveSubscription,
  sendSubscriptionOverEmail,
} = wf.proxyActivities<typeof activities>({
  startToCloseTimeout: "10 seconds",
});


export const cancelSubscription = wf.defineSignal("cancelSubscription");

export async function SubscriptionWorkflow(
  customer: Customer
): Promise<string> {
  let subscriptionCancelled = false;
  let totalCharged = 0;

  const CustomerIdName = useState("CustomerIdName", "customerid");
  const BillingPeriodNumber = useState("BillingPeriodNumber", 0);
  const BillingPeriodChargeAmount = useState(
    "BillingPeriodChargeAmount",
    customer.Subscription.initialBillingPeriodCharge
  );

  wf.setHandler(CustomerIdName.query, () => customer.Id);
  wf.setHandler(cancelSubscription, () => void (subscriptionCancelled = true));

  // Send welcome email to customer
  await sendWelcomeEmail(customer);

  // Start the free trial period. User can still cancel subscription during this time
  if (
    await wf.condition(
      customer.Subscription.TrialPeriod,
      () => subscriptionCancelled
    )
  ) {
    // If customer cancelled their subscription during trial period, send notification email
    await sendCancellationEmailDuringTrialPeriod(customer);
    // We have completed subscription for this customer.
    // Finishing workflow execution
    return "Subscription finished for: " + customer.Id;
  } else {
    // Trial period is over, start billing until
    // we reach the max billing periods for the subscription
    // or sub has been cancelled
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (BillingPeriodNumber.value >= customer.Subscription.MaxBillingPeriods)
        break;
      console.log('charging', customer.Id, BillingPeriodChargeAmount.value)
      await chargeCustomerForBillingPeriod(
        customer,
        BillingPeriodChargeAmount.value
      );
      totalCharged += BillingPeriodChargeAmount.value;
      // Wait 1 billing period to charge customer or if they cancel subscription
      // whichever comes first
      if (
        await wf.condition(
          customer.Subscription.BillingPeriod,
          () => subscriptionCancelled
        )
      ) {
        // If customer cancelled their subscription send notification email
        await sendCancellationEmailDuringActiveSubscription(customer);
        break;
      }
      BillingPeriodNumber.value++;
    }
    // if we get here the subscription period is over
    // notify the customer to buy a new subscription
    if (!subscriptionCancelled) {
      await sendSubscriptionOverEmail(customer);
    }
    return "Completed " + wf.workflowInfo().workflowId + ", Total Charged: " + totalCharged;
  }
}

function useState<T = any>(name: string, initialValue: T) {
  const signal = wf.defineSignal<[T]>(name);
  const query = wf.defineQuery<T>(name);
  let state: T = initialValue;
  // wf.setHandler(signal, (newValue: T) => void (state = newValue));
  wf.setHandler(signal, (newValue: T) => {
    console.log('updating ', name, newValue)
    state = newValue
  });
  wf.setHandler(query, () => state);
  return {
    signal,
    query,
    get value() {
      // need to use closure because function doesn't rerun unlike React Hooks
      return state;
    },
    set value(newVal: T) {
      state = newVal;
    },
  };
}
// @@@SNIPEND