// Reads specific to this dashboard: every listed vault on every chain, the curator ranking, and
// Morpho's share of chain lending from DefiLlama. Dashboard file (not a kit file).
import { cache } from 'react';
import { config } from '@/datum.config';
import { hasKey, query } from './datum';
import { num } from './format';
import { chainLogo, chainName } from './chains';
import { SAMPLE_AS_OF } from './sample';

export type Vault = { id: string; chainId: number; chain: string; name: string; symbol: string; asset: string; version: number; tvl: number; apy: number; netApy: number; fee: number; idle: number; curator: string; address: string; logos?: { chain?: string } };
export type Curator = { id: string; name: string; vaults: number; v2: number; chains: number; tvl: number; share: number; revenue: number };
export type ChainRow = { id: string; chain: string; tvlNet: number; tvlGross: number; borrowed: number; share: number; logo?: string };

const LOCAL = new Set(['ethereum', 'base', 'arbitrum', 'optimism', 'avalanche', 'polygon', 'unichain']);
const title = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\bL1\b/, 'L1');
const logoBySlug = (slug: string) => (LOCAL.has(slug) ? `/brand/logos/chain-${slug}.webp` : `https://icons.llamao.fi/icons/chains/rsz_${slug.replace(/ /g, '%20')}.jpg`);

/** Every listed vault on every chain, largest first. */
export const loadVaults = cache(async (): Promise<{ asOf: string; vaults: Vault[] }> => {
  if (!hasKey()) return sampleVaults();
  const v = config.resources.vaults;
  const r = await query(v.product, v.name, { ...v.filters, limit: 5000 });
  const vaults: Vault[] = r.rows.map((x) => ({
    id: `${x.chain_id}-${String(x.vault_address ?? '').toLowerCase()}`, chainId: num(x.chain_id), chain: chainName(String(x.chain_id)), logos: { chain: chainLogo(String(x.chain_id)) },
    name: String(x.name ?? ''), symbol: String(x.symbol ?? ''), asset: String(x.asset_symbol ?? ''), version: num(x.vault_version),
    tvl: num(x.total_assets_usd), apy: num(x.apy), netApy: num(x.net_apy), fee: num(x.fee_pct), idle: num(x.idle_assets_usd),
    curator: String(x.curator ?? 'UNATTRIBUTED'), address: String(x.vault_address ?? ''),
  })).sort((a, b) => b.tvl - a.tvl);
  return { asOf: (r.day ?? '').slice(0, 10), vaults };
});

/** The curator ranking the platform derives from listed vaults (V1 and V2), largest first. */
export const loadCurators = cache(async (): Promise<{ asOf: string; curators: Curator[] }> => {
  if (!hasKey()) return sampleCurators();
  const c = config.resources.curators;
  const r = await query(c.product, c.name, { limit: 500 });
  const curators: Curator[] = r.rows.map((x) => ({
    id: String(x.curator ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-'), name: String(x.curator ?? ''), vaults: num(x.vaults), v2: num(x.v2_vaults), chains: num(x.chains),
    tvl: num(x.tvl_usd), share: num(x.share_of_vault_tvl) * 100, revenue: num(x.est_annual_fee_revenue_usd),
  })).sort((a, b) => b.tvl - a.tvl);
  return { asOf: (r.day ?? '').slice(0, 10), curators };
});

/** Morpho on each chain by DefiLlama: net and gross TVL, borrowed, and its share of the tracked lending set. */
export const loadChains = cache(async (): Promise<{ asOf: string; chains: ChainRow[] }> => {
  if (!hasKey()) return sampleChains();
  const p = config.resources.protocols;
  const r = await query(p.product, p.name, { slug: config.product.defillamaSlug, limit: 500 });
  const chains: ChainRow[] = r.rows.map((x) => ({
    id: String(x.chain ?? '').replace(/ /g, '-'), chain: title(String(x.chain ?? '')), tvlNet: num(x.tvl_net_usd), tvlGross: num(x.tvl_gross_usd), borrowed: num(x.borrowed_usd),
    share: num(x.share_of_tracked_lending) * 100, logo: logoBySlug(String(x.chain ?? '')),
  })).filter((c) => c.tvlNet > 0).sort((a, b) => b.tvlNet - a.tvlNet);
  return { asOf: (r.day ?? '').slice(0, 10), chains };
});

// Sample data for a run without a key, labelled as such by the page frame.
function sampleVaults(): { asOf: string; vaults: Vault[] } {
  const rows: [number, string, string, string, number, number, number, string][] = [
    [1, 'Steakhouse USDC', 'steakUSDC', 'USDC', 2, 1_412e6, 4.1, 'Steakhouse Financial'], [8453, 'Sentora USDC', 'sUSDC', 'USDC', 2, 690e6, 4.4, 'Sentora'],
    [1, 'Gauntlet WETH Prime', 'gtWETH', 'WETH', 1, 388e6, 2.3, 'Gauntlet'], [1, 'Spark USDC Vault', 'spUSDC', 'USDC', 2, 360e6, 3.9, 'SparkDAO'],
    [8453, 'Galaxy cbBTC', 'gxBTC', 'cbBTC', 2, 152e6, 0.9, 'Galaxy Curation'], [42161, 'Re7 USDT', 're7USDT', 'USDT', 1, 61e6, 3.7, 'Re7 Labs'],
  ];
  return { asOf: SAMPLE_AS_OF, vaults: rows.map(([chainId, name, symbol, asset, version, tvl, netApy, curator], i) => ({ id: `${chainId}-0xbeef${i}`, chainId, chain: chainName(chainId), logos: { chain: chainLogo(chainId) }, name, symbol, asset, version, tvl, apy: netApy + 0.3, netApy, fee: version === 2 ? 0 : 10, idle: tvl * 0.06, curator, address: `0xbeef${i}` })) };
}
function sampleCurators(): { asOf: string; curators: Curator[] } {
  const rows: [string, number, number, number, number, number][] = [['Steakhouse Financial', 57, 37, 8, 2274e6, 6.43e6], ['Sentora', 24, 20, 5, 1350e6, 3.1e6], ['Gauntlet', 41, 12, 6, 918e6, 4.2e6], ['SparkDAO', 6, 6, 3, 360e6, 0.4e6], ['Galaxy Curation', 9, 9, 2, 152e6, 0.5e6], ['Re7 Labs', 18, 4, 4, 121e6, 0.7e6]];
  const total = rows.reduce((a, r) => a + r[4], 0) / 0.92;
  return { asOf: SAMPLE_AS_OF, curators: rows.map(([name, vaults, v2, chains, tvl, revenue]) => ({ id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name, vaults, v2, chains, tvl, share: (tvl / total) * 100, revenue })) };
}
function sampleChains(): { asOf: string; chains: ChainRow[] } {
  const rows: [string, number, number, number, number][] = [['ethereum', 4755e6, 9.1e9, 3.4e9, 15.1], ['base', 3937e6, 6.2e9, 2.6e9, 87.2], ['robinhood chain', 528e6, 0.9e9, 0.44e9, 100], ['hyperliquid l1', 245e6, 0.4e9, 0.2e9, 99], ['arc', 227e6, 0.3e9, 0.1e9, 100], ['monad', 179e6, 0.3e9, 0.1e9, 23.9]];
  return { asOf: SAMPLE_AS_OF, chains: rows.map(([chain, tvlNet, tvlGross, borrowed, share]) => ({ id: chain.replace(/ /g, '-'), chain: title(chain), tvlNet, tvlGross, borrowed, share, logo: logoBySlug(chain) })) };
}
