export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4">
          <span className="text-base-blue">Real</span>Base
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Self-sustaining autonomous agent for SF affordable housing data
        </p>
        <p className="text-gray-500 max-w-2xl mx-auto">
          RealBase aggregates data from 7 sources (schools, crime, transit,
          walkability, census, DAHLIA listings, rental market) to score San
          Francisco neighborhoods and help people find affordable housing. It
          runs autonomously on Base blockchain, earning revenue through x402
          API payments, NFT reports, and an onchain data oracle.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <Card
          title="x402 Data API"
          description="Pay-per-request neighborhood data API. Other agents and developers pay USDC for real-time SF housing insights."
        />
        <Card
          title="NFT Reports"
          description="ERC-721 neighborhood analysis snapshots minted on Base. Frozen-in-time data with school ratings, crime stats, and more."
        />
        <Card
          title="Onchain Oracle"
          description="Smart contract storing neighborhood scores that other contracts can query for a fee."
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-16">
        <Feature
          title="7 Data Sources"
          items={[
            "GreatSchools (school ratings)",
            "SF OpenData (crime)",
            "Census ACS (demographics)",
            "Walk Score (walkability)",
            "BART + Muni (transit)",
            "DAHLIA (affordable housing)",
            "RentCast (market rents)",
          ]}
        />
        <Feature
          title="Closed-Loop Economy"
          items={[
            "Earns USDC via x402 API",
            "Mints NFT reports for revenue",
            "Earns from oracle queries",
            "Deposits idle USDC in Aave",
            "Pays for enrichment data via x402",
            "All txs include ERC-8021 builder codes",
            "Tracks every cent on dashboard",
          ]}
        />
      </div>

      <div className="text-center">
        <a
          href="/dashboard"
          className="inline-block bg-base-blue text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-600 transition-colors"
        >
          View Agent Dashboard
        </a>
      </div>
    </div>
  );
}

function Card({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function Feature({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border border-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="text-gray-400 text-sm flex items-start gap-2">
            <span className="text-base-blue mt-0.5">&#8226;</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
