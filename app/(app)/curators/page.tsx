import { loadCurators } from '@/lib/morpho';
import { count, pct, usd } from '@/lib/format';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, DonutChart } from '@/components/charts';
import { CuratorsTable } from '@/components/morpho-tables';

export const revalidate = 300;
export const metadata = { title: 'Curators' };

export default async function Curators() {
  const { asOf, curators } = await loadCurators();
  const top3 = curators.slice(0, 3);
  const top3Share = top3.reduce((a, c) => a + c.share, 0);
  const revenue = curators.reduce((a, c) => a + c.revenue, 0);
  const byRevenue = [...curators].sort((a, b) => b.revenue - a.revenue).slice(0, 10).map((c) => ({ name: c.name, revenue: c.revenue }));
  return (
    <>
      <PageHeader eyebrow="Curators" question="Who steers the money in Morpho vaults, and what does it earn them?"
        answer={<>{count(curators.length)} curators run the listed vaults as of {asOf}. The three largest, {top3.map((c) => c.name).join(', ')}, hold {pct(top3Share, 0)} of vault TVL between them. Across every curator the performance fees add up to an estimated {usd(revenue)} a year at today&apos;s rates.</>} />
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @4xl/main:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Share of vault TVL</CardTitle><CardDescription>Concentration among curators. A curator&apos;s share is its vaults&apos; TVL over all listed vault TVL, V1 and V2 together.</CardDescription></CardHeader>
          <CardContent><DonutChart items={curators.slice(0, 8).map((c) => ({ name: c.name, value: c.tvl }))} unit="usd" height={240} centerLabel="vault TVL" /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Fee revenue estimate, top ten</CardTitle><CardDescription>Vault TVL times the performance fee times the net APY, annualised. Run rate at today&apos;s numbers, not accounting; zero-fee vaults earn their curator nothing here.</CardDescription></CardHeader>
          <CardContent className="px-2"><BarChart data={byRevenue} x="name" series={[{ key: 'revenue', label: 'Fee revenue' }]} unit="usd" horizontal labels height={Math.max(220, byRevenue.length * 30)} categoryWidth={130} /></CardContent>
        </Card>
      </div>
      <CuratorsTable data={curators} title="All curators"
        caption={<><b className="font-medium text-foreground">Every curator with a listed vault, largest first.</b> Attribution follows the first curator the Morpho API lists for a vault; vaults with none appear as UNATTRIBUTED.</>} />
    </>
  );
}
