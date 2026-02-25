import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../src/store/useAppStore';
import { ResultCard } from '../../src/components/results/ResultCard';
import { Button } from '../../src/components/ui/Button';
import { Colors, Typography, Spacing } from '../../src/theme';

export default function CompareScreen() {
  const router = useRouter();
  const { results, activeScenario } = useAppStore();

  if (results.length === 0) {
    return (
      <SafeAreaView style={styles.empty}>
        <Text style={styles.emptyEmoji}>⚖️</Text>
        <Text style={styles.emptyTitle}>Nicio comparație încă</Text>
        <Text style={styles.emptySubtitle}>
          Introdu parametrii creditului din ecranul principal pentru a vedea comparația
        </Text>
        <Button
          label="Începe comparația"
          onPress={() => router.push('/')}
          variant="primary"
          style={{ marginTop: Spacing.xl }}
        />
      </SafeAreaView>
    );
  }

  const eligible = results.filter((r) => r.eligibility.isEligible);
  const ineligible = results.filter((r) => !r.eligibility.isEligible);

  const scenarioLabel: Record<string, string> = {
    A: '📊 Scenariul A — Sumă dorită',
    B: '💳 Scenariul B — Rată lunară maximă',
    C: '🔄 Scenariul C — Refinanțare',
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={[...eligible, ...ineligible]}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            {activeScenario && (
              <Text style={styles.scenarioLabel}>{scenarioLabel[activeScenario]}</Text>
            )}
            <Text style={styles.summary}>
              {eligible.length} oferte eligibile din {results.length} total
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <ResultCard
            result={item}
            rank={index + 1}
            onPress={() => {
              useAppStore.getState().setSelectedResultId(item.product.id);
              router.push('/amortization');
            }}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  empty: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
  },
  emptyEmoji: { fontSize: 56, marginBottom: Spacing.md },
  emptyTitle: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    fontFamily: 'System',
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.base * 1.5,
    fontFamily: 'System',
  },
  list: { padding: Spacing.base, paddingBottom: Spacing['3xl'] },
  header: { marginBottom: Spacing.md },
  scenarioLabel: {
    fontSize: Typography.sm,
    color: Colors.primary,
    fontWeight: Typography.semibold,
    fontFamily: 'System',
    marginBottom: 4,
  },
  summary: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    fontFamily: 'System',
  },
});
