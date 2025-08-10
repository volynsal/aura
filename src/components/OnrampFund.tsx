import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FundButton } from "@coinbase/onchainkit/fund";

export default function OnrampFund() {
  return (
    <section className="py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle>Fund your wallet</CardTitle>
            <CardDescription>
              Buy crypto with card, bank, or Coinbase balance via Coinbase Onramp.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex">
              <FundButton text="Add funds" />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
