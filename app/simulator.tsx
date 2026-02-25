import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useAppStore } from '../src/store/useAppStore';
import { calculateMonthlyPayment } from '../src/engine/calculator';
import { Card } from '../src/components/ui/Card';
import { SliderInput } from '../src/components/ui/SliderInput';
import { Colors, Typography, Spacing, Radius } from '../src/theme';
import { formatEUR, formatPct, formatPeriod } from '../src/utils/format';

export default function SimulatorScreen() {
  const { results, selectedResultId } = useAppStore();

  const baseResult = useMemo(
    () => results.find((r) => r.product.id === selectedResultId) ?? results[0],
    [results, selectedResultId],
  );

  const baseMonths = baseResult?.amortizationSchedule.length ?? 300;
  const baseLoan = baseResult?.loanAmount ?? 80_000;
  const baseRate = baseResult?.product.annualRate ?? 6;

  const [loanAmount, setLoanAmount] = useState(baseLoan);
  const [periodMonths, setPeriodMonths] = useState(baseMonths);
  const [annualRate, setAnnualRate] = useState(baseRate);

  const simMonthlyPayment = useMemo(
    () => calculateMonthlyPayment(loanAmount, annualRate, periodMonths),
    [loanAmount, annualRate, periodMonths],
  );

  const simTotalPaid = simMonthlyPayment * periodMonths;
  const simTotalInterest = simTotalPaid - loanAmount;

  const baseMonthlyPayment = baseResult?.monthlyPayment ?? 0;
  const baseTotalCost = baseResult?.totalCost ?? 0;

  const diffMonthly = simMonthlyPayment - baseMonthlyPayment;
  const diffTotal = simTotalPaid - baseTotalCost;

  // Scenarios for different rates
  const rateScenarios = [
    { label: 'Optimist (−2%)', rate: Math.max(0.1, annualRate - 2), color: Colors.success },
    { label: 'Curent', rate: annualRate, color: Colors.primary },
    { label: 'Pesimist (+2%)', rate: annualRate + 2, color: Colors.error },
  ];

  // Scenarios for different periods
  const periodScenarios = [
    { label: '15 ani', months: 180 },
    { label: '20 ani', months: 240 },
    { label: '25 ani', months: 300 },
    { label: '30 ani', months: 360 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Ajustează parametrii și vezi instant cum se schimbă rata și costul total.
        </Text>

        {/* Sliders */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Parametrii simulare</Text>
          <SliderInput
            label="Suma împrumutată"
            value={loanAmount}
            min={10_000}
            max={500_000}
            step={5_000}
            onValueChange={setLoanAmount}
            formatValue={(v) => formatEUR(v)}
          />
          <SliderInput
            label="Perioada"
            value={periodMonths}
            min={60}
            max={360}
            step={12}
            onValueChange={setPeriodMonths}
            formatValue={(v) => formatPeriod(v)}
          />
          <SliderInput
            label="Dobânda anuală"
            value={annualRate}
            min={1}
            max={15}
            step={0.1}
            onValueChange={setAnnualRate}
            formatValue={(v) => `${v.toFixed(1)}%`}
          />
        </Card>

        {/* Live result */}
        <Card style={styles.resultCard}>
          <Text style={styles.cardTitle}>Rezultat simulare</Text>
          <View style={styles.mainMetrics}>
            <View style={styles.mainMetric}>
              <Text style={styles.mainMetricValue}>{formatEUR(simMonthlyPayment)}</Text>
              <Text style={styles.mainMetricLabel}>rată lunară</Text>
            </View>
            <View style={styles.mainMetricDivider} />
            <View style={styles.mainMetric}>
              <Text style={styles.mainMetricValue}>{formatEUR(simTotalPaid, 0)}</Text>
              <Text style={styles.mainMetricLabel}>cost total</Text>
            </View>
            <View style={styles.mainMetricDivider} />
            <View style={styles.mainMetric}>
              <Text style={styles.mainMetricValue}>{formatEUR(simTotalInterest, 0)}</Text>
              <Text style={styles.mainMetricLabel}>dobândă</Text>
            </View>
          </View>

          {/* Delta vs base */}
          {baseResult && (
            <View style={styles.deltaRow}>
              <DeltaChip label="vs ofertă selectată · rată" delta={diffMonthly} unit="/lună" />
              <DeltaChip label="cost total" delta={diffTotal} />
            </View>
          )}
        </Card>

        {/* Rate scenarios */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Scenarii dobândă (±2%)</Text>
          {rateScenarios.map((s) => {
            const mp = calculateMonthlyPayment(loanAmount, s.rate, periodMonths);
            return (
              <View key={s.label} style={styles.scenarioRow}>
                <View style={[styles.scenarioDot, { backgroundColor: s.color }]} />
                <Text style={styles.scenarioLabel}>{s.label}</Text>
                <Text style={styles.scenarioRate}>{formatPct(s.rate)}</Text>
                <Text style={[styles.scenarioPayment, { color: s.color }]}>{formatEUR(mp)}/lună</Text>
              </View>
            );
          })}
        </Card>

        {/* Period scenarios */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Impact perioadă (la aceeași sumă și dobândă)</Text>
          {periodScenarios.map((s) => {
            const mp = calculateMonthlyPayment(loanAmount, annualRate, s.months);
            const total = mp * s.months;
            const interest = total - loanAmount;
            return (
              <View key={s.label} style={styles.periodRow}>
                <Text style={styles.periodLabel}>{s.label}</Text>
                <View style={styles.periodMetrics}>
                  <Text style={styles.periodPayment}>{formatEUR(mp)}/lună</Text>
                  <Text style={styles.periodInterest}>dobândă: {formatEUR(interest, 0)}</Text>
                </View>
              </View>
            );
          })}
        </Card>

        {/* Down payment impact */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Impact avans (la aceeași proprietate)</Text>
          <Text style={styles.cardSubtitle}>
            Proprietate: {formatEUR(loanAmount * 1.2, 0)} · perioadă: {formatPeriod(periodMonths)} · dobândă: {formatPct(annualRate)}
          </Text>
          {[10, 15, 20, 25, 30].map((advPct) => {
            const propVal = loanAmount * 1.2;
            const advEur = propVal * (advPct / 100);
            const loanAdv = propVal - advEur;
            const mp = calculateMonthlyPayment(loanAdv, annualRate, periodMonths);
            return (
              <View key={advPct} style={styles.periodRow}>
                <Text style={styles.periodLabel}>Avans {advPct}% ({formatEUR(advEur, 0)})</Text>
                <View style={styles.periodMetrics}>
                  <Text style={styles.periodPayment}>{formatEUR(mp)}/lună</Text>
                  <Text style={styles.periodInterest}>credit: {formatEUR(loanAdv, 0)}</Text>
                </View>
              </View>
            );
          })}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function DeltaChip({ label, delta, unit = '' }: { label: string; delta: number; unit?: string }) {
  const isPos = delta > 0;
  const color = isPos ? Colors.error : Colors.success;
  const sign = isPos ? '+' : '';
  return (
    <View style={[styles.deltaChip, { borderColor: color }]}>
      <Text style={[styles.deltaText, { color }]}>
        {sign}{formatEUR(Math.abs(delta))}{unit}
      </Text>
      <Text style={styles.deltaLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: Spacing['4xl'] },
  subtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sm * 1.5,
    marginBottom: Spacing.lg,
    fontFamily: 'System',
  },
  card: { marginBottom: Spacing.md },
  cardTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.sm, fontFamily: 'System' },
  cardSubtitle: { fontSize: Typography.xs, color: Colors.textMuted, marginBottom: Spacing.sm, fontFamily: 'System' },

  resultCard: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  mainMetrics: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  mainMetric: { flex: 1, alignItems: 'center' },
  mainMetricValue: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: Colors.primaryDark,
    fontFamily: 'System',
    textAlign: 'center',
  },
  mainMetricLabel: { fontSize: Typography.xs, color: Colors.primary, fontFamily: 'System', textAlign: 'center', marginTop: 2 },
  mainMetricDivider: { width: 1, backgroundColor: Colors.primary + '40' },
  deltaRow: { flexDirection: 'row', gap: Spacing.sm },
  deltaChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.xs + 2,
    alignItems: 'center',
  },
  deltaText: { fontSize: Typography.sm, fontWeight: Typography.bold, fontFamily: 'System' },
  deltaLabel: { fontSize: Typography.xs - 1, color: Colors.textMuted, fontFamily: 'System', textAlign: 'center' },

  scenarioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  scenarioDot: { width: 8, height: 8, borderRadius: 4 },
  scenarioLabel: { flex: 1, fontSize: Typography.sm, color: Colors.textSecondary, fontFamily: 'System' },
  scenarioRate: { fontSize: Typography.sm, color: Colors.textMuted, fontFamily: 'System', width: 55, textAlign: 'right' },
  scenarioPayment: { fontSize: Typography.sm, fontWeight: Typography.semibold, fontFamily: 'System', width: 90, textAlign: 'right' },

  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  periodLabel: { fontSize: Typography.sm, color: Colors.textSecondary, fontFamily: 'System', flex: 1 },
  periodMetrics: { alignItems: 'flex-end' },
  periodPayment: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.primary, fontFamily: 'System' },
  periodInterest: { fontSize: Typography.xs, color: Colors.textMuted, fontFamily: 'System' },
});
