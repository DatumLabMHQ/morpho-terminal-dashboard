// The only file most dashboards need to edit. Name the product, the platform resources the pages
// read, how their columns map onto the normalised shapes in lib/types.ts, and the navigation.
// lib/data.ts and the components do the rest. Without DATUM_API_KEY the pages run on labelled sample data.

// `datum new dashboard` fills the {{placeholders}}. Until then the template runs as the reference
// dashboard under these fallbacks, so it can be opened and judged as is.
const ph = (v: string, fallback: string) => (v.startsWith('{{') && v.endsWith('}}') ? fallback : v);

export const config = {
  // 'draft' until `datum check <slug>` prints READY and the owner signs the brief; the page says so.
  status: 'live' as 'draft' | 'live',
  slug: ph('morpho-terminal-dashboard', 'reference-dashboard'),
  // The name this dashboard's brief, product note and reconciliation rows use in datum-context.
  context: 'morpho-terminal',
  title: ph('Morpho Research Terminal', 'State of lending'),
  description: ph('Morpho as a sector: every listed market and vault on every chain, curators, share of chain lending, and the positions behind each market, built on the Datum data platform.', 'The reference dashboard for Datum Labs: the standard look and structure, running on labelled sample data until a platform key is set.'),
  // The question the overview answers. Pages lead with it.
  question: 'Where does Morpho stand as a lending sector today, and who steers the money?',
  // The product the markets belong to, as shown on the page and used for its logo.
  product: { slug: 'morpho', label: 'Morpho', defillamaSlug: 'morpho-blue' },
  // Resources are product/name pairs from GET /api/v1/products on datum-api. `filters` must be
  // filters that resource declares (see /api/v1/products); anything else is ignored by the API.
  resources: {
    // One row per chain, market and UTC day. Latest day by default; `day=` or `since=` for history.
    markets: { product: 'morpho', name: 'markets', filters: { listed: 'true' } as Record<string, string> },
    // The positions sample (largest suppliers and borrowers per market, twice a day) and its health bands.
    // When the platform does not serve them yet, the market page hides those two cards.
    positions: { product: 'morpho', name: 'positions' },
    health: { product: 'morpho', name: 'health' },
    // DefiLlama's own figure for the same protocol, stored beside ours for the reconciliation note.
    comparison: { product: 'defillama', name: 'tvl', filters: { slug: 'morpho-blue' } as Record<string, string> },
    // Every listed vault (V1 and V2) on every chain, and the curator ranking the platform derives from them.
    vaults: { product: 'morpho', name: 'vaults', filters: { listed: 'true' } as Record<string, string> },
    curators: { product: 'morpho', name: 'curators' },
    // DefiLlama net TVL per chain for Morpho and eleven comparator lending protocols: Morpho's share of chain lending.
    protocols: { product: 'morpho', name: 'protocols' },
  },
  // Column names in the markets resource for each normalised field (lib/types.ts Market), and
  // which of them the resource stores as fractions (0.86) rather than percent (86).
  fields: {
    id: 'market_id', chain: 'chain_id', collateral: 'collateral_symbol', loan: 'loan_symbol',
    supplied: 'supply_assets_usd', borrowed: 'borrow_assets_usd', utilization: 'utilization', supply_apy: 'supply_apy', borrow_apy: 'borrow_apy', lltv: 'lltv', day: 'day',
    // extra columns shown on the market page when present
    liquidity: 'liquidity_assets_usd', collateralValue: 'collateral_assets_usd', badDebt: 'bad_debt_usd', fee: 'fee_pct', address: 'market_id',
  },
  fractions: ['lltv'] as string[],
  // How far back the overview trend goes, and how often it samples our own count (one API call
  // per point, so weekly points keep it to about a dozen calls).
  trend: { days: 90, stepDays: 7 },
  // The sign-in gate: the overview is open to everyone; every other page asks once for a name, an email
  // and an occupation (kept on that browser). Leads join the Datum Labs list through app/api/gate.
  gate: { enabled: true, free: ['/'] as string[] },
  nav: [
    { href: '/', label: 'Overview' },
    { href: '/markets', label: 'Markets' },
    { href: '/vaults', label: 'Vaults' },
    { href: '/curators', label: 'Curators' },
    { href: '/chains', label: 'Chains' },
    { href: '/methodology', label: 'Methodology' },
  ],
  // Shown on the methodology page. Keep them honest: what is read, how often, what it excludes.
  // role: 'headline' is our own count; 'comparison' is stored beside it and never the headline.
  sources: [
    { name: 'Datum data platform', role: 'headline' as 'headline' | 'comparison', cadence: 'hourly snapshots', detail: 'Every listed Morpho market and vault (V1 and V2) on every chain the platform tracks, read through datum-api from the Morpho API. Daily grain is the last observation of the UTC day. History starts 4 September 2026.' },
    { name: 'Datum data platform: positions sample', role: 'headline' as 'headline' | 'comparison', cadence: 'twice a day', detail: 'The 20 largest suppliers and 40 largest borrowers of the 100 largest listed markets, with health factors. A sample, never the book: each market page says what share of the market it covers.' },
    { name: 'Morpho curator registry', role: 'headline' as 'headline' | 'comparison', cadence: 'hourly', detail: 'Vault TVL is attributed to the first curator the Morpho API lists for a vault; vaults with none are UNATTRIBUTED. The fee revenue estimate is vault TVL times the performance fee times the net APY, annualised.' },
    { name: 'DefiLlama', role: 'comparison' as 'headline' | 'comparison', cadence: 'daily', detail: 'Read for the reconciliation note and for the share of chain lending: Morpho\'s net TVL per chain against eleven comparator lending protocols. Its TVL counts collateral, ours counts assets supplied, so the two differ by definition.' },
  ],
  definitions: [
    { term: 'Supplied', unit: 'USD', text: 'Value of loan assets supplied to listed markets at the snapshot, at the platform price feed.' },
    { term: 'Borrowed', unit: 'USD', text: 'Value of outstanding debt in listed markets.' },
    { term: 'Utilisation', unit: '%', text: 'Borrowed divided by supplied, per market and in aggregate. Above 85% withdrawals may queue.' },
    { term: 'Supply APY', unit: '% a year', text: 'The rate the protocol reports for suppliers at the snapshot. The headline is weighted by supplied value.' },
    { term: 'Borrow APY', unit: '% a year', text: 'The rate borrowers pay at the snapshot, before fees.' },
    { term: 'LLTV', unit: '%', text: 'Liquidation loan to value: the debt to collateral ratio at which a position can be liquidated.' },
    { term: 'Listed', unit: 'flag', text: 'Markets and vaults the protocol lists in its own interface. Unlisted ones exist on chain but include dust and fake-price entries, so they are excluded from every number here.' },
    { term: 'Vault TVL', unit: 'USD', text: 'Assets deposited in a listed vault at the snapshot, V1 and V2 together. Idle is the part not yet lent to a market.' },
    { term: 'Net APY', unit: '% a year', text: 'What a vault depositor earns after the vault fee, at the snapshot.' },
    { term: 'Curator share', unit: '%', text: 'A curator\'s vault TVL divided by all listed vault TVL. Attribution follows the first curator the Morpho API lists.' },
    { term: 'Fee revenue estimate', unit: 'USD a year', text: 'Vault TVL times the performance fee times the net APY, annualised. An estimate of the run rate, not accounting.' },
    { term: 'Share of chain lending', unit: '%', text: 'Morpho\'s DefiLlama net TVL on a chain divided by the net TVL of the twelve tracked lending protocols on that chain.' },
  ],
};
export type DatumConfig = typeof config;
