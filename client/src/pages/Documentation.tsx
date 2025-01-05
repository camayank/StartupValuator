import { Card, CardContent } from "@/components/ui/card";

export function Documentation() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Documentation</h1>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Valuation Endpoint</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">POST /api/valuation</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Calculate startup valuation based on provided metrics
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Request Body</h4>
                <pre className="bg-muted p-4 rounded-md text-sm">
{`{
  "revenue": number,
  "growthRate": number,
  "margins": number,
  "industry": string,
  "stage": string
}`}
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2">Response</h4>
                <pre className="bg-muted p-4 rounded-md text-sm">
{`{
  "valuation": number,
  "multiplier": number,
  "methodology": string,
  "details": {
    "baseValuation": number,
    "adjustments": object
  }
}`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Rate Limits</h2>
            <p className="text-sm text-muted-foreground">
              The API is rate limited to 100 requests per hour per IP address.
              Responses include rate limit headers:
            </p>
            <ul className="list-disc list-inside mt-2 text-sm space-y-1">
              <li>X-RateLimit-Limit: Maximum requests per hour</li>
              <li>X-RateLimit-Remaining: Remaining requests</li>
              <li>X-RateLimit-Reset: Time until limit resets</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
