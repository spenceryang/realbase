export default function ApiDocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-2">x402 API Documentation</h1>
      <p className="text-gray-500 mb-8 text-sm">
        Access RealBase neighborhood data via x402 micropayments on Base
      </p>

      <div className="space-y-8">
        <Section title="How It Works">
          <p className="text-gray-400 text-sm mb-4">
            RealBase uses the x402 HTTP payment protocol. Send a request to a
            paywalled endpoint. You&apos;ll receive a 402 Payment Required
            response with payment instructions. Pay with USDC on Base, then
            re-send your request with the payment proof.
          </p>
        </Section>

        <Section title="Free Endpoints">
          <Endpoint
            method="GET"
            path="/api/v1/health"
            description="Agent health status"
            price="Free"
          />
          <Endpoint
            method="GET"
            path="/api/v1/stats"
            description="Agent metrics, wallet balance, transactions"
            price="Free"
          />
          <Endpoint
            method="GET"
            path="/api/v1/neighborhoods"
            description="List all SF neighborhoods (names + zipcodes)"
            price="Free"
          />
        </Section>

        <Section title="Paywalled Endpoints (x402)">
          <Endpoint
            method="GET"
            path="/api/v1/neighborhood/:zipcode"
            description="Full neighborhood analysis with composite scores"
            price="$0.005 USDC"
          />
          <Endpoint
            method="GET"
            path="/api/v1/listings/search"
            description="Search affordable housing listings with filters"
            price="$0.001 USDC"
          />
          <Endpoint
            method="GET"
            path="/api/v1/compare?zip1=X&zip2=Y"
            description="Compare two neighborhoods side-by-side"
            price="$0.01 USDC"
          />
        </Section>

        <Section title="Smart Contracts (Base Mainnet)">
          <div className="space-y-3 text-sm">
            <div className="border border-gray-800 rounded p-3">
              <p className="font-bold text-gray-300">RealBaseOracle</p>
              <p className="text-gray-500 text-xs mt-1">
                Query neighborhood scores onchain.{" "}
                <code className="text-gray-400">
                  getScore(zipcode)
                </code>{" "}
                — 0.0001 ETH per query.
              </p>
            </div>
            <div className="border border-gray-800 rounded p-3">
              <p className="font-bold text-gray-300">RealBaseReport (ERC-721)</p>
              <p className="text-gray-500 text-xs mt-1">
                Mint neighborhood analysis NFTs.{" "}
                <code className="text-gray-400">
                  publicMint(zipcode, uri)
                </code>{" "}
                — 0.001 ETH per mint.
              </p>
            </div>
          </div>
        </Section>

        <Section title="Builder Code">
          <p className="text-gray-400 text-sm">
            Every transaction from this agent includes ERC-8021 builder code{" "}
            <code className="text-base-blue">realbase</code>. Track our
            activity on{" "}
            <a
              href="https://base.dev"
              className="text-base-blue hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              base.dev
            </a>
            .
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Endpoint({
  method,
  path,
  description,
  price,
}: {
  method: string;
  path: string;
  description: string;
  price: string;
}) {
  const isFree = price === "Free";
  return (
    <div className="border border-gray-800 rounded p-3 mb-2">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold bg-gray-800 px-2 py-0.5 rounded">
          {method}
        </span>
        <code className="text-sm text-gray-300">{path}</code>
        <span
          className={`text-xs ml-auto ${
            isFree ? "text-gray-500" : "text-yellow-500"
          }`}
        >
          {price}
        </span>
      </div>
      <p className="text-gray-500 text-xs mt-1">{description}</p>
    </div>
  );
}
