import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../src/store/useAppStore';
import { ResultCard } from '../src/components/results/ResultCard';
import { Button } from '../src/components/ui/Button';
import { Colors, Typography, Spacing } from '../src/theme';

type Filter = 'all' | 'fixed' | 'variable' | 'mixed';

export default function ResultsScreen() {
  const router = useRouter();
  const { results, activeScenario, setSelectedResultId } = useAppStore();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = results.filter((r) => {
    if (filter === 'all') return true;
    return r.product.interestType === filter.toUpperCase();
  });

  const eligible = filtered.filter((r) => r.eligibility.isEligible);
  const ineligible = filtered.filter((r) => !r.eligibility.isEligible);
  const ordered = [...eligible, ...ineligible];

  const scenarioLabel: Record<string, string> = {
    A: '🏡 Sumă dorită',
    B: '💳 Rată maximă',
    C: '🔄 Refinanțare',
  };

  const FILTERS: { key: Filter; label: string }[] = [
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
            {/* Summary header */}
            <View style={styles.summaryHeader}>
              <View style={styles.summaryLeft}>
                {activeScenario && (
                  <Text style={styles.scenarioLabel}>{scenarioLabel[activeScenario]}</Text>
                )}
                <Text style={styles.resultCount}>
                  {eligible.length} eligibile · {ineligible.length} neeligibile
                </Text>
              </View>
              <Button
                label="Simulator →"
                onPress={() => router.push('/simulator')}
                variant="outline"
                size="sm"
              />
            </View>

            {/* Filter tabs */}
            <View style={styles.filterRow}>
              {FILTERS.map((f) => (
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
                <Text style={styles.noResultsText}>Nicio ofertă pentru filtrul selectat</Text>
              </View>
            )}
          </>
        }
        renderItem={({ item, index }) => {
          const globalRank = results.findIndex((r) => r.product.id === item.product.id) + 1;
          return (
            <ResultCard
              result={item}
              rank={globalRank}
              onPress={() => {
                setSelectedResultId(item.product.id);
                router.push('/amortization');
              }}
              showSavings={activeScenario !== 'B'}
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
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  filterTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: 20,
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
  noResults: { alignItems: 'center', padding: Spacing.xl },
  noResultsText: { fontSize: Typography.base, color: Colors.textMuted, fontFamily: 'System' },
});
