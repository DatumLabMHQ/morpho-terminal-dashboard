'use client';
// Vaults, curators and chains on the kit's DataTable. Dashboard file: the columns belong to this product.
import { Badge } from '@/components/ui/badge';
import { AssetAvatar } from '@/components/asset-avatar';
import { DataTable, defineColumns, SortHeader } from '@/components/data-table';
import { count, pct, usd } from '@/lib/format';
import type { ChainRow, Curator, Vault } from '@/lib/morpho';

type Caption = React.ReactNode;

const vaultColumns = defineColumns<Vault>((col) => [
  col.accessor('name', { header: 'Vault', enableHiding: false, cell: ({ row }) => (
    <span className="flex items-center gap-2.5"><AssetAvatar symbol={row.original.asset} /><span className="leading-tight"><span className="block font-medium">{row.original.name}</span><span className="block text-xs text-muted-foreground">{row.original.symbol}</span></span></span>) }),
  col.accessor('chain', { header: 'Chain', cell: ({ row }) => <span className="inline-flex items-center gap-1.5 text-muted-foreground"><AssetAvatar symbol={row.original.chain} src={row.original.logos?.chain} className="size-4" />{row.original.chain}</span> }),
  col.accessor('curator', { header: 'Curator', cell: ({ row }) => <span className="text-muted-foreground">{row.original.curator}</span> }),
  col.accessor('version', { header: 'Version', cell: ({ row }) => <Badge variant="outline" className="px-1.5 text-muted-foreground">V{row.original.version}</Badge> }),
  col.accessor('tvl', { header: ({ column }) => <SortHeader column={column} label="TVL" />, cell: ({ row }) => <span className="tabular-nums">{usd(row.original.tvl)}</span> }),
  col.accessor('netApy', { header: ({ column }) => <SortHeader column={column} label="Net APY" />, cell: ({ row }) => <span className="tabular-nums">{pct(row.original.netApy)}</span> }),
  col.accessor('fee', { header: 'Fee', cell: ({ row }) => <span className="tabular-nums text-muted-foreground">{pct(row.original.fee, 0)}</span> }),
  col.accessor('idle', { header: ({ column }) => <SortHeader column={column} label="Idle" />, cell: ({ row }) => <span className="tabular-nums text-muted-foreground">{usd(row.original.idle)}</span> }),
]);
export function VaultsTable({ data, title, caption, pageSize = 12 }: { data: Vault[]; title: string; caption: Caption; pageSize?: number }) {
  return <DataTable<Vault> rows={data} columns={vaultColumns} title={title} caption={caption} getRowId={(v) => v.id}
    search={(v, q) => `${v.name} ${v.symbol} ${v.asset} ${v.curator} ${v.chain}`.toLowerCase().includes(q)} searchPlaceholder="Filter vaults"
    numeric={['tvl', 'netApy', 'fee', 'idle']} labels={{ name: 'Vault', chain: 'Chain', curator: 'Curator', version: 'Version', tvl: 'TVL', netApy: 'Net APY', fee: 'Fee', idle: 'Idle' }}
    initialSort={[{ id: 'tvl', desc: true }]} pageSize={pageSize} noun="vault" empty="No vaults match." />;
}

const curatorColumns = defineColumns<Curator>((col) => [
  col.accessor('name', { header: 'Curator', enableHiding: false, cell: ({ row }) => <span className="flex items-center gap-2.5"><AssetAvatar symbol={row.original.name} /><span className="font-medium">{row.original.name}</span></span> }),
  col.accessor('tvl', { header: ({ column }) => <SortHeader column={column} label="Vault TVL" />, cell: ({ row }) => <span className="tabular-nums">{usd(row.original.tvl)}</span> }),
  col.accessor('share', { header: ({ column }) => <SortHeader column={column} label="Share" />, cell: ({ row }) => <Badge variant="outline" className="px-1.5 tabular-nums">{pct(row.original.share, 1)}</Badge> }),
  col.accessor('vaults', { header: ({ column }) => <SortHeader column={column} label="Vaults" />, cell: ({ row }) => <span className="tabular-nums text-muted-foreground">{count(row.original.vaults)} <span className="text-xs">({count(row.original.v2)} V2)</span></span> }),
  col.accessor('chains', { header: 'Chains', cell: ({ row }) => <span className="tabular-nums text-muted-foreground">{count(row.original.chains)}</span> }),
  col.accessor('revenue', { header: ({ column }) => <SortHeader column={column} label="Fee revenue, est." />, cell: ({ row }) => <span className="tabular-nums">{usd(row.original.revenue)}</span> }),
]);
export function CuratorsTable({ data, title, caption, pageSize = 12 }: { data: Curator[]; title: string; caption: Caption; pageSize?: number }) {
  return <DataTable<Curator> rows={data} columns={curatorColumns} title={title} caption={caption} getRowId={(c) => c.id}
    search={(c, q) => c.name.toLowerCase().includes(q)} searchPlaceholder="Filter curators"
    numeric={['tvl', 'share', 'vaults', 'chains', 'revenue']} labels={{ name: 'Curator', tvl: 'Vault TVL', share: 'Share', vaults: 'Vaults', chains: 'Chains', revenue: 'Fee revenue, est.' }}
    initialSort={[{ id: 'tvl', desc: true }]} pageSize={pageSize} noun="curator" empty="No curators match." />;
}

const chainColumns = defineColumns<ChainRow>((col) => [
  col.accessor('chain', { header: 'Chain', enableHiding: false, cell: ({ row }) => <span className="flex items-center gap-2.5"><AssetAvatar symbol={row.original.chain} src={row.original.logo} /><span className="font-medium">{row.original.chain}</span></span> }),
  col.accessor('tvlNet', { header: ({ column }) => <SortHeader column={column} label="Net TVL" />, cell: ({ row }) => <span className="tabular-nums">{usd(row.original.tvlNet)}</span> }),
  col.accessor('borrowed', { header: ({ column }) => <SortHeader column={column} label="Borrowed" />, cell: ({ row }) => <span className="tabular-nums">{usd(row.original.borrowed)}</span> }),
  col.accessor('tvlGross', { header: 'Gross TVL', cell: ({ row }) => <span className="tabular-nums text-muted-foreground">{usd(row.original.tvlGross)}</span> }),
  col.accessor('share', { header: ({ column }) => <SortHeader column={column} label="Share of chain lending" />, cell: ({ row }) => <Badge variant="outline" className="px-1.5 tabular-nums">{pct(row.original.share, 1)}</Badge> }),
]);
export function ChainsTable({ data, title, caption, pageSize = 12 }: { data: ChainRow[]; title: string; caption: Caption; pageSize?: number }) {
  return <DataTable<ChainRow> rows={data} columns={chainColumns} title={title} caption={caption} getRowId={(c) => c.id}
    search={(c, q) => c.chain.toLowerCase().includes(q)} searchPlaceholder="Filter chains"
    numeric={['tvlNet', 'borrowed', 'tvlGross', 'share']} labels={{ chain: 'Chain', tvlNet: 'Net TVL', borrowed: 'Borrowed', tvlGross: 'Gross TVL', share: 'Share of chain lending' }}
    initialSort={[{ id: 'tvlNet', desc: true }]} pageSize={pageSize} noun="chain" empty="No chains match." />;
}
