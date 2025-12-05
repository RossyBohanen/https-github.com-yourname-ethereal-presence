import { NextRequest, NextResponse } from "next/server";
import autumn from "@/lib/billing/autumn";
import db from "@/lib/db/client";

export async function POST(request: NextRequest) {
  try {
    const { action, customerId, featureId, productId } = await request.json();

    switch (action) {
      case "check-access":
        const access = await autumn.features.check({
          customerId,
          featureId,
        });
        return NextResponse.json(access);

      case "track-usage":
        const tracking = await autumn.features.track({
          customerId,
          featureId,
          value: 1,
        });
        return NextResponse.json(tracking);

      case "create-checkout":
        const checkout = await autumn.checkout.create({
          customerId,
          productId,
        });
        return NextResponse.json(checkout);

      default:
        return NextResponse.json(
          { error: "Unknown action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Billing error:", error);
    return NextResponse.json(
      { error: "Billing operation failed" },
      { status: 500 }
    );
  }
}
