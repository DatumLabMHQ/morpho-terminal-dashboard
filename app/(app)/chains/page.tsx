import { loadChains } from '@/lib/morpho';
import { count, pct, usd } from '@/lib/format';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, DonutChart } from '@/components/charts';
import { ChainsTable } from '@/components/morpho-tables';

export const revalidate = 300;
export const metadata = { title: 'Chains' };

export default async function Chains() {
  const { asOf, chains } = await loadChains();
  const total = chains.reduce((a, c) => a + c.tvlNet, 0);
  const lead = chains.filter((c) => c.share >= 50);
  const share = chains.slice(0, 10).map((c) => ({ name: c.chain, share: c.share }));
  return (
    <>
      <PageHeader eyebrow="Chains" question="On which chains is Morpho the lending layer, and where is it one of several?"
        answer={<>By DefiLlama&apos;s count Morpho holds {usd(total)} of net TVL across {count(chains.length)} chains as of {asOf}. It is more than half of tracked lending on {count(lead.length)} of them{lead.length ? ` (${lead.slice(0, 4).map((c) => c.chain).join(', ')}${lead.length > 4 ? ' and others' : ''})` : ''}; on Ethereum it competes with Aave and holds {pct(chains.find((c) => c.chain === 'Ethereum')?.share ?? 0, 0)}.</>} />
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @4xl/main:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Share of chain lending</CardTitle><CardDescription>Morpho&apos;s net TVL over the twelve tracked lending protocols on each chain. A share near 100% means Morpho is the only lender that matters there.</CardDescription></CardHeader>
          <CardContent className="px-2"><BarChart data={share} x="name" series={[{ key: 'share', label: 'Share' }]} unit="pct" horizontal labels height={Math.max(220, share.length * 30)} categoryWidth={120} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Net TVL by chain</CardTitle><CardDescription>Where Morpho&apos;s money is, by DefiLlama&apos;s net measure (unallocated vault balances excluded).</CardDescription></CardHeader>
          <CardContent><DonutChart items={chains.map((c) => ({ name: c.chain, value: c.tvlNet }))} unit="usd" height={240} centerLabel="net TVL" /></CardContent>
        </Card>
      </div>
      <ChainsTable data={chains} title="Morpho by chain"
        caption={<><b className="font-medium text-foreground">DefiLlama&apos;s view, one row per chain.</b> Gross TVL counts collateral posted; net TVL excludes unallocated vault balances; borrowed is the debt outstanding. Our own supplied figures per market are on the Markets page.</>} />
    </>
  );
}
