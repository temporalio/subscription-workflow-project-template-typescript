// @@@SNIPSTART subscription-ts-activities
import { log } from "@temporalio/activity";

import { Customer } from "./shared";

export async function sendWelcomeEmail(customer: Customer) {
  log.info(`Sending welcome email to ${customer.email}`);
}
export async function sendCancellationEmailDuringTrialPeriod(
  customer: Customer
) {
  log.info(`Sending trial cancellation email to ${customer.email}`);
}
export async function chargeCustomerForBillingPeriod(
  customer: Customer,
  chargeAmount: number
) {
  log.info(
    `Charging ${customer.email} amount ${chargeAmount} for their billing period`
  );
}
export async function sendCancellationEmailDuringActiveSubscription(
  customer: Customer
) {
  log.info(`Sending active subscriber cancellation email to ${customer.email}`);
}
export async function sendSubscriptionOverEmail(customer: Customer) {
  log.info(`Sending subscription over email to ${customer.email}`);
}
// @@@SNIPEND
