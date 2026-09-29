/* True only in the separate customer build (vite.customer.config.ts defines it). The staff
   build never defines it, so every branch guarded by it is dead code there and the internal
   app is unchanged. A build-time constant rather than a runtime flag on purpose: a customer
   cannot flip it, and the staff bundle carries none of the customer wiring. */
export const CUSTOMER: boolean = (import.meta.env as Record<string, unknown>).VITE_CUSTOMER === "1";

/** The only workflows a customer sees: the Support pair. The derived Voice/SMS routing pair
 *  would preview the Support agent under a diagram that describes a different one. */
export const isSupportWorkflowPath = (to: string) => /\/workflow\/support-(sms|voice)$/.test(to);
