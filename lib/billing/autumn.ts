import Autumn from "autumn";
import { instrumentAutumn } from "@kubiks/otel-autumn";

const autumn = new Autumn({
  apiKey: process.env.AUTUMN_API_KEY || "",
});

// Add OpenTelemetry instrumentation
instrumentAutumn(autumn);

export default autumn;

// Billing operations
export async function checkFeatureAccess(
  customerId: string,
  featureId: string
) {
  const result = await autumn.features.check({
    customerId,
    featureId,
  });
  return result;
}

export async function trackUsage(
  customerId: string,
  featureId: string,
  value: number = 1
) {
  const result = await autumn.features.track({
    customerId,
    featureId,
    value,
  });
  return result;
}

export async function createCheckout(
  customerId: string,
  productId: string
) {
  const result = await autumn.checkout.create({
    customerId,
    productId,
  });
  return result;
}
