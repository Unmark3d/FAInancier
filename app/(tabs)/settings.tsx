import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useAppStore } from '../../src/store/useAppStore';
import { SliderInput } from '../../src/components/ui/SliderInput';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { Colors, Typography, Spacing, Radius } from '../../src/theme';

export default function SettingsScreen() {
  const { weights, setWeights, resetWeights } = useAppStore();

  const total = weights.totalCost + weights.flexibility + weights.stability + weights.bankReputation;

  const updateWeight = (key: keyof typeof weights, val: number) => {
    setWeights({ ...weights, [key]: val });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Setări scor recomandare</Text>
        <Text style={styles.pageSubtitle}>
          Ajustează importanța fiecărui criteriu în recomandare. Suma ponderilor: {(total * 100).toFixed(0)}%
        </Text>

        {total < 0.99 || total > 1.01 ? (
          <View style={styles.warning}>
            <Text style={styles.warningText}>⚠️ Suma ponderilor trebuie să fie 100%. Acum: {(total * 100).toFixed(0)}%</Text>
          </View>
        ) : null}

        <Card style={styles.card}>
          <SliderInput
            label="💰 Cost total (prioritate)"
            value={Math.round(weights.totalCost * 100)}
            min={10}
            max={80}
            step={5}
            onValueChange={(v) => updateWeight('totalCost', v / 100)}
            formatValue={(v) => `${v}%`}
            hint="Cât de important este costul total al creditului"
          />
          <SliderInput
            label="🔓 Flexibilitate"
            value={Math.round(weights.flexibility * 100)}
            min={5}
            max={50}
            step={5}
            onValueChange={(v) => updateWeight('flexibility', v / 100)}
            formatValue={(v) => `${v}%`}
            hint="Posibilitate rambursare anticipată, perioadă de grație"
          />
          <SliderInput
            label="🛡️ Stabilitate dobândă"
            value={Math.round(weights.stability * 100)}
            min={5}
            max={50}
            step={5}
            onValueChange={(v) => updateWeight('stability', v / 100)}
            formatValue={(v) => `${v}%`}
            hint="Fixă > Mixtă > Variabilă"
          />
          <SliderInput
            label="🏦 Reputație bancă"
            value={Math.round(weights.bankReputation * 100)}
            min={5}
            max={30}
            step={5}
            onValueChange={(v) => updateWeight('bankReputation', v / 100)}
            formatValue={(v) => `${v}%`}
            hint="Rating și stabilitate financiară"
          />
        </Card>

        <Button
          label="Resetează la valorile implicite"
          onPress={resetWeights}
          variant="outline"
          fullWidth
          style={{ marginTop: Spacing.md }}
        />

        <Card style={[styles.card, styles.infoCard]}>
          <Text style={styles.infoTitle}>ℹ️ Valorile implicite</Text>
          <InfoRow label="Cost total" value="50%" />
          <InfoRow label="Flexibilitate" value="20%" />
          <InfoRow label="Stabilitate" value="20%" />
          <InfoRow label="Reputație bancă" value="10%" />
        </Card>

        <Card style={[styles.card, styles.irccCard]}>
          <Text style={styles.infoTitle}>📊 Date de referință</Text>
          <InfoRow label="IRCC curent (Q4 2024)" value="5,86%" />
          <InfoRow label="Grad max îndatorare BNR" value="40%" />
          <InfoRow label="Vârstă max la final credit" value="70 ani" />
          <Text style={styles.irccNote}>
            IRCC se actualizează trimestrial de Banca Națională a României.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: Spacing['3xl'] },
  pageTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    fontFamily: 'System',
  },
  pageSubtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    fontFamily: 'System',
    lineHeight: Typography.sm * 1.5,
  },
  card: { marginBottom: Spacing.md },
  warning: {
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  warningText: { fontSize: Typography.sm, color: Colors.warning, fontFamily: 'System' },
  infoCard: { backgroundColor: Colors.surfaceElevated },
  irccCard: { backgroundColor: Colors.primaryLight },
  infoTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    fontFamily: 'System',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: { fontSize: Typography.sm, color: Colors.textSecondary, fontFamily: 'System' },
  infoValue: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textPrimary, fontFamily: 'System' },
  irccNote: {
    fontSize: Typography.xs,
    color: Colors.primary,
    marginTop: Spacing.sm,
    fontFamily: 'System',
  },
});
