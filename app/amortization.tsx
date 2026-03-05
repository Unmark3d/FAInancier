import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  LayoutAnimation,
} from 'react-native';
import { useAppStore } from '../src/store/useAppStore';
import { Card } from '../src/components/ui/Card';
import { Colors, Typography, Spacing, Radius } from '../src/theme';
import { formatEUR, formatPct } from '../src/utils/format';
import { MonthlyRow } from '../src/engine/types';

type ViewMode = 'summary' | 'table' | 'chart';

export default function AmortizationScreen() {
  const { results, selectedResultId } = useAppStore();
  const [viewMode, setViewMode] = useState<ViewMode>('summary');

  const result = useMemo(
    () => results.find((r) => r.product.id === selectedResultId) ?? results[0],
    [results, selectedResultId],
  );

  if (!result) {
    return (
      <SafeAreaView style={styles.empty}>
        <Text style={styles.emptyText}>Niciun rezultat selectat</Text>
      </SafeAreaView>
    );
  }

  const { amortizationSchedule: schedule, product, monthlyPayment, dae, totalCost, totalInterest, openingCost, totalInsurance, loanAmount } = result;

  // Year-grouped summary
  const yearSummaries = useMemo(() => {
    const years: { year: number; interest: number; principal: number; balance: number }[] = [];
    for (let y = 1; y <= Math.ceil(schedule.length / 12); y++) {
      const rows = schedule.slice((y - 1) * 12, y * 12);
      const interest = rows.reduce((s, r) => s + r.interestPart, 0);
      const principal = rows.reduce((s, r) => s + r.principalPart, 0);
      const balance = rows[rows.length - 1]?.remainingBalance ?? 0;
      years.push({ year: y, interest, principal, balance });
    }
    return years;
  }, [schedule]);

  const MODES: { key: ViewMode; label: string }[] = [
    { key: 'summary', label: 'Rezumat' },
    { key: 'chart', label: 'Grafic anual' },
    { key: 'table', label: 'Tabel lunar' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Product header */}
      <View style={styles.productHeader}>
        <Text style={styles.bankName}>{product.bankName}</Text>
        <Text style={styles.productName}>{product.productName}</Text>
      </View>

      {/* View mode tabs */}
      <View style={styles.tabs}>
        {MODES.map((m) => (
          <TouchableOpacity
            key={m.key}
            style={[styles.tab, viewMode === m.key && styles.tabActive]}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setViewMode(m.key);
            }}
          >
            <Text style={[styles.tabText, viewMode === m.key && styles.tabTextActive]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {viewMode === 'summary' && (
        <FlatList
          data={[]}
          keyExtractor={() => 'header'}
          renderItem={null}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          ListHeaderComponent={
            <>
              {/* Key metrics */}
              <Card style={styles.card}>
                <Text style={styles.cardTitle}>Costul creditului</Text>
                <MetricRow label="Capital împrumutat" value={formatEUR(loanAmount)} />
                <MetricRow label="Rată lunară" value={formatEUR(monthlyPayment)} highlight />
                <MetricRow label="DAE" value={formatPct(dae)} />
                <MetricRow label="Dobândă totală" value={formatEUR(totalInterest)} />
                <MetricRow label="Asigurări totale" value={formatEUR(totalInsurance)} />
                <MetricRow label="Comision acordare" value={formatEUR(openingCost)} />
                <View style={styles.divider} />
                <MetricRow label="Cost total" value={formatEUR(totalCost)} bold />
              </Card>

              {/* Cost breakdown visual */}
              <Card style={styles.card}>
                <Text style={styles.cardTitle}>Structura costurilor</Text>
                <CostBar
                  items={[
                    { label: 'Capital', value: loanAmount, color: Colors.primary },
                    { label: 'Dobândă', value: totalInterest, color: Colors.warning },
                    { label: 'Asigurări', value: totalInsurance, color: Colors.accent },
                    { label: 'Comisioane', value: openingCost, color: Colors.textMuted },
                  ]}
                  total={totalCost}
                />
              </Card>

              {/* First 5 years highlight */}
              <Card style={styles.card}>
                <Text style={styles.cardTitle}>📅 Primii 5 ani</Text>
                {yearSummaries.slice(0, 5).map((y) => (
                  <View key={y.year} style={styles.yearRow}>
                    <Text style={styles.yearLabel}>Anul {y.year}</Text>
                    <View style={styles.yearMetrics}>
                      <Text style={styles.yearInterest}>↗ {formatEUR(y.interest)} dobândă</Text>
                      <Text style={styles.yearPrincipal}>↘ {formatEUR(y.principal)} capital</Text>
                    </View>
                    <Text style={styles.yearBalance}>{formatEUR(y.balance)} rămas</Text>
                  </View>
                ))}
              </Card>
            </>
          }
        />
      )}

      {viewMode === 'chart' && (
        <FlatList
          data={yearSummaries}
          keyExtractor={(item) => String(item.year)}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: y }) => {
            const maxInterest = Math.max(...yearSummaries.map((ys) => ys.interest));
            const interestWidth = (y.interest / maxInterest) * 100;
            const principalWidth = (y.principal / maxInterest) * 100;

            return (
              <View style={styles.chartRow}>
                <Text style={styles.chartYear}>An {y.year}</Text>
                <View style={styles.chartBars}>
                  <View style={styles.chartBarRow}>
                    <View style={[styles.chartBar, { width: `${interestWidth}%`, backgroundColor: Colors.warning }]} />
                    <Text style={styles.chartBarLabel}>{formatEUR(y.interest)}</Text>
                  </View>
                  <View style={styles.chartBarRow}>
                    <View style={[styles.chartBar, { width: `${principalWidth}%`, backgroundColor: Colors.primary }]} />
                    <Text style={styles.chartBarLabel}>{formatEUR(y.principal)}</Text>
                  </View>
                </View>
              </View>
            );
          }}
          ListHeaderComponent={
            <View style={styles.chartLegend}>
              <LegendItem color={Colors.warning} label="Dobândă" />
              <LegendItem color={Colors.primary} label="Capital rambursat" />
            </View>
          }
        />
      )}

      {viewMode === 'table' && (
        <FlatList
          data={schedule}
          keyExtractor={(item) => String(item.month)}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          initialNumToRender={24}
          getItemLayout={(_, index) => ({ length: 44, offset: 44 * index, index })}
          ListHeaderComponent={
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.tableHeaderCell, { flex: 0.5 }]}>Luna</Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell]}>Rată</Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell]}>Dobândă</Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell]}>Capital</Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell]}>Sold</Text>
            </View>
          }
          renderItem={({ item: row, index }) => (
            <View style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}>
              <Text style={[styles.tableCell, { flex: 0.5 }]}>{row.month}</Text>
              <Text style={styles.tableCell}>{Math.round(row.monthlyPayment)}</Text>
              <Text style={[styles.tableCell, { color: Colors.warning }]}>{Math.round(row.interestPart)}</Text>
              <Text style={[styles.tableCell, { color: Colors.primary }]}>{Math.round(row.principalPart)}</Text>
              <Text style={styles.tableCell}>{Math.round(row.remainingBalance)}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

function MetricRow({ label, value, highlight, bold }: { label: string; value: string; highlight?: boolean; bold?: boolean }) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, highlight && { color: Colors.primary }, bold && { fontWeight: '700', color: Colors.textPrimary }]}>
        {value}
      </Text>
    </View>
  );
}

function CostBar({ items, total }: { items: { label: string; value: number; color: string }[]; total: number }) {
  return (
    <View>
      <View style={styles.costBarContainer}>
        {items.map((item) => (
          <View
            key={item.label}
            style={[
              styles.costBarSegment,
              { flex: item.value / total, backgroundColor: item.color },
            ]}
          />
        ))}
      </View>
      <View style={styles.costBarLegend}>
        {items.map((item) => (
          <View key={item.label} style={styles.costBarLegendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendLabel}>{item.label}</Text>
            <Text style={styles.legendValue}>{((item.value / total) * 100).toFixed(0)}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItemRow}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  emptyText: { fontSize: Typography.base, color: Colors.textMuted, fontFamily: 'System' },

  productHeader: { padding: Spacing.base, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  bankName: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary, fontFamily: 'System' },
  productName: { fontSize: Typography.sm, color: Colors.textSecondary, fontFamily: 'System' },

  tabs: { flexDirection: 'row', backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, paddingVertical: Spacing.sm + 2, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { fontSize: Typography.sm, color: Colors.textSecondary, fontFamily: 'System', fontWeight: Typography.medium },
  tabTextActive: { color: Colors.primary, fontWeight: Typography.semibold },

  content: { padding: Spacing.base, paddingBottom: Spacing['3xl'] },
  card: { marginBottom: Spacing.md },
  cardTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.md, fontFamily: 'System' },

  metricRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs + 2, borderBottomWidth: 1, borderBottomColor: Colors.border + '80' },
  metricLabel: { fontSize: Typography.sm, color: Colors.textSecondary, fontFamily: 'System' },
  metricValue: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.textPrimary, fontFamily: 'System' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },

  costBarContainer: { flexDirection: 'row', height: 20, borderRadius: Radius.sm, overflow: 'hidden', marginBottom: Spacing.md },
  costBarSegment: { height: '100%' },
  costBarLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  costBarLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: Typography.xs, color: Colors.textSecondary, fontFamily: 'System' },
  legendValue: { fontSize: Typography.xs, fontWeight: Typography.semibold, color: Colors.textPrimary, fontFamily: 'System' },
  legendItemRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginRight: Spacing.md },

  yearRow: { paddingVertical: Spacing.xs + 2, borderBottomWidth: 1, borderBottomColor: Colors.border },
  yearLabel: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textPrimary, fontFamily: 'System' },
  yearMetrics: { flexDirection: 'row', gap: Spacing.md, marginTop: 2 },
  yearInterest: { fontSize: Typography.xs, color: Colors.warning, fontFamily: 'System' },
  yearPrincipal: { fontSize: Typography.xs, color: Colors.primary, fontFamily: 'System' },
  yearBalance: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2, fontFamily: 'System' },

  chartLegend: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing.md },
  chartRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.sm },
  chartYear: { width: 40, fontSize: Typography.xs, color: Colors.textSecondary, fontFamily: 'System' },
  chartBars: { flex: 1, gap: 3 },
  chartBarRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  chartBar: { height: 10, borderRadius: 5, minWidth: 4 },
  chartBarLabel: { fontSize: Typography.xs - 1, color: Colors.textMuted, fontFamily: 'System' },

  tableHeader: { flexDirection: 'row', backgroundColor: Colors.surfaceElevated, padding: Spacing.sm, borderRadius: Radius.sm, marginBottom: 2 },
  tableHeaderCell: { fontWeight: Typography.semibold, color: Colors.textSecondary },
  tableRow: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: Spacing.sm },
  tableRowAlt: { backgroundColor: Colors.surfaceElevated },
  tableCell: { flex: 1, fontSize: Typography.xs, color: Colors.textPrimary, fontFamily: 'System', textAlign: 'right' },
});
