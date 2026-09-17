import { loadVaults } from '@/lib/morpho';
import { count, pct, usd } from '@/lib/format';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DonutChart } from '@/components/charts';
import { VaultsTable } from '@/components/morpho-tables';

export const revalidate = 300;
export const metadata = { title: 'Vaults' };

export default async function Vaults() {
  const { asOf, vaults } = await loadVaults();
  const tvl = vaults.reduce((a, v) => a + v.tvl, 0);
  const v2 = vaults.filter((v) => v.version === 2);
  const v2Tvl = v2.reduce((a, v) => a + v.tvl, 0);
  const share = (key: (v: typeof vaults[number]) => string) => { const m = new Map<string, number>(); vaults.forEach((v) => m.set(key(v), (m.get(key(v)) ?? 0) + v.tvl)); return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value); };
  const weighted = tvl ? vaults.reduce((a, v) => a + v.netApy * v.tvl, 0) / tvl : 0;
  return (
    <>
      <PageHeader eyebrow="Vaults" question="Where do Morpho depositors put their money, and what do they earn?"
        answer={<>{count(vaults.length)} listed vaults hold {usd(tvl)} as of {asOf}, earning {pct(weighted)} net on average weighted by size. Vault V2 is {count(v2.length)} of them and {pct(tvl ? (v2Tvl / tvl) * 100 : 0, 0)} of the money.</>} />
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @4xl/main:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Vault TVL by chain</CardTitle><CardDescription>Where the deposits sit. Ethereum and Base carry most of it; the long tail is where new chains show up first.</CardDescription></CardHeader>
          <CardContent><DonutChart items={share((v) => v.chain)} unit="usd" height={220} centerLabel="vault TVL" /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Vault TVL by asset</CardTitle><CardDescription>What depositors hand over. Dollar vaults dominate; the ETH and BTC vaults are where rates are thinnest.</CardDescription></CardHeader>
          <CardContent><DonutChart items={share((v) => v.asset)} unit="usd" height={220} centerLabel="vault TVL" /></CardContent>
        </Card>
      </div>
      <VaultsTable data={vaults} title="All listed vaults" pageSize={15}
        caption={<><b className="font-medium text-foreground">Every listed vault on every chain, largest first.</b> Idle is the part of TVL not yet lent out; a high idle share drags the net APY below the markets the vault allocates to. The Curators page says who steers each one.</>} />
    </>
  );
}
