import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../src/store/useAppStore';
import { ResultCard } from '../src/components/results/ResultCard';
import { Button } from '../src/components/ui/Button';
import { Colors, Typography, Spacing, Radius, Shadow } from '../src/theme';
import { formatEUR } from '../src/utils/format';
import { CalculationResult } from '../src/engine/types';

type Filter = 'all' | 'fixed' | 'variable' | 'mixed';
type RefinanceFilter = 'beneficial' | 'all';

export default function ResultsScreen() {
  const router = useRouter();
  const { results, activeScenario, setSelectedResultId } = useAppStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [refinanceFilter, setRefinanceFilter] = useState<RefinanceFilter>('beneficial');

  const isRefinance = activeScenario === 'C';

  // Type filter
  const typeFiltered = results.filter((r) => {
    if (filter === 'all') return true;
    return r.product.interestType === filter.toUpperCase();
  });

  // Refinance filter: for Scenario C, default to showing only beneficial offers
  const displayResults = isRefinance && refinanceFilter === 'beneficial'
    ? typeFiltered.filter((r) => (r.monthlySavings ?? 0) > 0 && r.eligibility.isEligible)
    : typeFiltered;

  const eligible = displayResults.filter((r) => r.eligibility.isEligible);
  const ineligible = displayResults.filter((r) => !r.eligibility.isEligible);
  const ordered = [...eligible, ...ineligible];

  // Stats for refinance header
  const beneficialCount = results.filter(
    (r) => (r.monthlySavings ?? 0) > 0 && r.eligibility.isEligible,
  ).length;
  const bestSaving = results.reduce<CalculationResult | null>((best, r) => {
    if ((r.monthlySavings ?? 0) <= 0) return best;
    if (!best || (r.monthlySavings ?? 0) > (best.monthlySavings ?? 0)) return r;
    return best;
  }, null);

  const scenarioLabel: Record<string, string> = {
    A: '🏡 Sumă dorită',
    B: '💳 Rată maximă',
    C: '🔄 Refinanțare',
  };

  const TYPE_FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Toate' },
    { key: 'fixed', label: 'Fixă' },
    { key: 'variable', label: 'Variabilă' },
    { key: 'mixed', label: 'Mixtă' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={ordered}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* ── REFINANCE SUMMARY CARD ── */}
            {isRefinance && (
              <View style={styles.refinanceSummary}>
                <Text style={styles.refinanceSummaryTitle}>
                  🔄 Analiză refinanțare
                </Text>
                <View style={styles.refinanceStatsRow}>
                  <View style={styles.refinanceStat}>
                    <Text style={styles.refinanceStatValue}>{beneficialCount}</Text>
                    <Text style={styles.refinanceStatLabel}>oferte cu economii</Text>
                  </View>
                  <View style={styles.refinanceStat}>
                    <Text style={styles.refinanceStatValue}>
                      {bestSaving ? formatEUR(bestSaving.monthlySavings ?? 0) : '—'}
                    </Text>
                    <Text style={styles.refinanceStatLabel}>economie max/lună</Text>
                  </View>
                  <View style={styles.refinanceStat}>
                    <Text style={styles.refinanceStatValue}>
                      {bestSaving ? formatEUR(bestSaving.totalSavings ?? 0) : '—'}
                    </Text>
                    <Text style={styles.refinanceStatLabel}>economie totală max</Text>
                  </View>
                </View>

                {/* Beneficial toggle */}
                <View style={styles.refinanceToggle}>
                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      refinanceFilter === 'beneficial' && styles.toggleBtnActive,
                    ]}
                    onPress={() => setRefinanceFilter('beneficial')}
                  >
                    <Text style={[
                      styles.toggleBtnText,
                      refinanceFilter === 'beneficial' && styles.toggleBtnTextActive,
                    ]}>
                      ✓ Cu economii ({beneficialCount})
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      refinanceFilter === 'all' && styles.toggleBtnActive,
                    ]}
                    onPress={() => setRefinanceFilter('all')}
                  >
                    <Text style={[
                      styles.toggleBtnText,
                      refinanceFilter === 'all' && styles.toggleBtnTextActive,
                    ]}>
                      Toate ({results.length})
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ── STANDARD HEADER ── */}
            <View style={styles.summaryHeader}>
              <View style={styles.summaryLeft}>
                {activeScenario && (
                  <Text style={styles.scenarioLabel}>{scenarioLabel[activeScenario]}</Text>
                )}
                <Text style={styles.resultCount}>
                  {ordered.length} oferte afișate
                </Text>
              </View>
              {!isRefinance && (
                <Button
                  label="Simulator →"
                  onPress={() => router.push('/simulator')}
                  variant="outline"
                  size="sm"
                />
              )}
            </View>

            {/* ── TYPE FILTER TABS ── */}
            <View style={styles.filterRow}>
              {TYPE_FILTERS.map((f) => (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
                  onPress={() => setFilter(f.key)}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      filter === f.key && styles.filterTabTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {ordered.length === 0 && (
              <View style={styles.noResults}>
                <Text style={styles.noResultsEmoji}>🔍</Text>
                <Text style={styles.noResultsText}>
                  {isRefinance && refinanceFilter === 'beneficial'
                    ? 'Niciun produs nu oferă economii față de creditul actual.'
                    : 'Nicio ofertă pentru filtrul selectat.'}
                </Text>
                {isRefinance && refinanceFilter === 'beneficial' && (
                  <TouchableOpacity onPress={() => setRefinanceFilter('all')}>
                    <Text style={styles.noResultsLink}>Afișează toate ofertele →</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        }
        renderItem={({ item, index }) => {
          const globalRank = ordered.findIndex((r) => r.product.id === item.product.id) + 1;
          return (
            <ResultCard
              result={item}
              rank={globalRank}
              onPress={() => {
                setSelectedResultId(item.product.id);
                router.push('/amortization');
              }}
              showSavings={activeScenario === 'A'}
              isRefinance={isRefinance}
            />
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.base, paddingBottom: Spacing['4xl'] },

  // ── Refinance summary ─────────────────────────────────
  refinanceSummary: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.md,
  },
  refinanceSummaryTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    fontFamily: 'System',
    marginBottom: Spacing.md,
  },
  refinanceStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  refinanceStat: { alignItems: 'center', flex: 1 },
  refinanceStatValue: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.accent,
    fontFamily: 'System',
  },
  refinanceStatLabel: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    fontFamily: 'System',
    marginTop: 2,
  },

  refinanceToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: 3,
    gap: 3,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: Colors.surface, ...Shadow.sm },
  toggleBtnText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontFamily: 'System',
    fontWeight: Typography.medium,
  },
  toggleBtnTextActive: { color: Colors.primary, fontWeight: Typography.semibold },

  // ── Standard header ───────────────────────────────────
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  summaryLeft: { flex: 1 },
  scenarioLabel: {
    fontSize: Typography.xs,
    color: Colors.primary,
    fontWeight: Typography.semibold,
    fontFamily: 'System',
    marginBottom: 2,
  },
  resultCount: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    fontFamily: 'System',
  },

  // ── Type filter tabs ──────────────────────────────────
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  filterTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterTabText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontFamily: 'System',
    fontWeight: Typography.medium,
  },
  filterTabTextActive: { color: Colors.textInverse },

  // ── Empty state ───────────────────────────────────────
  noResults: { alignItems: 'center', padding: Spacing.xl, gap: Spacing.sm },
  noResultsEmoji: { fontSize: 40 },
  noResultsText: {
    fontSize: Typography.base,
    color: Colors.textMuted,
    fontFamily: 'System',
    textAlign: 'center',
  },
  noResultsLink: {
    fontSize: Typography.sm,
    color: Colors.primary,
    fontWeight: Typography.semibold,
    fontFamily: 'System',
    marginTop: Spacing.xs,
  },
});
