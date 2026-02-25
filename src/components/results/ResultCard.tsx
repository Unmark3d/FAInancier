import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CalculationResult } from '../../engine/types';
import { Card } from '../ui/Card';
import { ScoreRing } from '../ui/ScoreRing';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import { formatEUR, formatPct, formatPeriod, formatMonthly } from '../../utils/format';

interface ResultCardProps {
  result: CalculationResult;
  rank: number;
  onPress: () => void;
  showSavings?: boolean;
}

const INTEREST_TYPE_LABEL: Record<string, string> = {
  FIXED: 'Dobândă fixă',
  VARIABLE: 'Dobândă variabilă (IRCC)',
  MIXED: 'Dobândă mixtă',
};

const INTEREST_TYPE_COLOR: Record<string, string> = {
  FIXED: Colors.success,
  VARIABLE: Colors.warning,
  MIXED: Colors.info,
};

export function ResultCard({ result, rank, onPress, showSavings = true }: ResultCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { product, monthlyPayment, dae, totalCost, totalInterest, eligibility, scenarios, savingsVsAverage } = result;
  const isTop = rank === 1;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Card elevated={isTop} style={[styles.card, isTop && styles.cardTop]}>
        {/* Top badge */}
        {isTop && (
          <View style={styles.topBadge}>
            <Text style={styles.topBadgeText}>⭐ Cea mai bună ofertă</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.bankInfo}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>#{rank}</Text>
            </View>
            <View>
              <Text style={styles.bankName}>{product.bankName}</Text>
              <Text style={styles.productName}>{product.productName}</Text>
            </View>
          </View>
          <ScoreRing score={result.recommendationScore} size={56} />
        </View>

        {/* Interest type pill */}
        <View style={[styles.typePill, { backgroundColor: INTEREST_TYPE_COLOR[product.interestType] + '20' }]}>
          <View style={[styles.typeDot, { backgroundColor: INTEREST_TYPE_COLOR[product.interestType] }]} />
          <Text style={[styles.typeText, { color: INTEREST_TYPE_COLOR[product.interestType] }]}>
            {INTEREST_TYPE_LABEL[product.interestType]}
            {product.interestType !== 'FIXED' && ` · ${formatPct(product.annualRate)}`}
          </Text>
        </View>

        {/* Key metrics */}
        <View style={styles.metricsRow}>
          <MetricCell
            label="Rată lunară"
            value={formatEUR(monthlyPayment)}
            highlight
          />
          <MetricCell
            label="DAE"
            value={formatPct(dae)}
          />
          <MetricCell
            label="Cost total"
            value={formatEUR(totalCost, 0)}
          />
        </View>

        {/* Variable scenarios */}
        {scenarios && (
          <View style={styles.scenarios}>
            <Text style={styles.scenariosTitle}>Scenarii dobândă variabilă:</Text>
            <View style={styles.scenariosRow}>
              <ScenarioPill label="Optimist" value={formatEUR(scenarios.optimistic.monthlyPayment)} color={Colors.success} />
              <ScenarioPill label="Neutru" value={formatEUR(scenarios.neutral.monthlyPayment)} color={Colors.warning} />
              <ScenarioPill label="Pesimist" value={formatEUR(scenarios.pessimistic.monthlyPayment)} color={Colors.error} />
            </View>
          </View>
        )}

        {/* Savings vs average */}
        {showSavings && savingsVsAverage !== undefined && savingsVsAverage > 0 && (
          <View style={styles.savings}>
            <Text style={styles.savingsText}>
              💰 Economisești {formatEUR(savingsVsAverage)} față de media pieței
            </Text>
          </View>
        )}

        {/* Ineligible warning */}
        {!eligibility.isEligible && (
          <View style={styles.ineligible}>
            <Text style={styles.ineligibleTitle}>⚠️ Potențial neeligibil</Text>
            {eligibility.reasons.map((r, i) => (
              <Text key={i} style={styles.ineligibleReason}>• {r}</Text>
            ))}
          </View>
        )}

        {/* Expandable details */}
        <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.expandBtn}>
          <Text style={styles.expandText}>{expanded ? '▲ Mai puțin' : '▼ Detalii costuri'}</Text>
        </TouchableOpacity>

        {expanded && (
          <View style={styles.details}>
            <DetailRow label="Dobândă totală" value={formatEUR(totalInterest)} />
            <DetailRow label="Asigurări totale" value={formatEUR(result.totalInsurance)} />
            <DetailRow label="Comision acordare" value={formatEUR(result.openingCost)} />
            {product.earlyRepaymentPenalty && (
              <DetailRow label="Penalizare rambursare anticipată" value="Da" warn />
            )}
            {product.gracePeriodMonths > 0 && (
              <DetailRow label="Perioadă de grație" value={formatPeriod(product.gracePeriodMonths)} />
            )}
            <DetailRow label="LTV maxim" value={formatPct(product.maxLTV, 0)} />
            <DetailRow label="Perioadă maximă" value={formatPeriod(product.maxPeriodMonths)} />
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

function MetricCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.metricCell}>
      <Text style={[styles.metricValue, highlight && styles.metricValueHighlight]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function ScenarioPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.scenarioPill, { borderColor: color }]}>
      <Text style={[styles.scenarioPillLabel, { color }]}>{label}</Text>
      <Text style={[styles.scenarioPillValue, { color }]}>{value}</Text>
    </View>
  );
}

function DetailRow({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, warn && { color: Colors.warning }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.md },
  cardTop: { borderColor: Colors.primary, borderWidth: 2 },

  topBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  topBadgeText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.primary,
    fontFamily: 'System',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  bankInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.textSecondary },
  bankName: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary, fontFamily: 'System' },
  productName: { fontSize: Typography.xs, color: Colors.textSecondary, fontFamily: 'System' },

  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
    gap: 5,
  },
  typeDot: { width: 7, height: 7, borderRadius: 4 },
  typeText: { fontSize: Typography.xs, fontWeight: Typography.semibold, fontFamily: 'System' },

  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  metricCell: { alignItems: 'center', flex: 1 },
  metricValue: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    fontFamily: 'System',
    textAlign: 'center',
  },
  metricValueHighlight: { color: Colors.primary, fontSize: Typography.md },
  metricLabel: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2, textAlign: 'center', fontFamily: 'System' },

  scenarios: { marginBottom: Spacing.sm },
  scenariosTitle: { fontSize: Typography.xs, color: Colors.textSecondary, marginBottom: Spacing.xs, fontFamily: 'System' },
  scenariosRow: { flexDirection: 'row', gap: Spacing.xs },
  scenarioPill: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.xs,
  },
  scenarioPillLabel: { fontSize: Typography.xs - 1, fontFamily: 'System' },
  scenarioPillValue: { fontSize: Typography.xs, fontWeight: Typography.semibold, fontFamily: 'System' },

  savings: {
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  savingsText: { fontSize: Typography.sm, color: Colors.accent, fontWeight: Typography.medium, fontFamily: 'System' },

  ineligible: {
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  ineligibleTitle: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.warning, fontFamily: 'System', marginBottom: 2 },
  ineligibleReason: { fontSize: Typography.xs, color: Colors.warning, fontFamily: 'System' },

  expandBtn: { alignItems: 'center', paddingTop: Spacing.xs },
  expandText: { fontSize: Typography.xs, color: Colors.primary, fontWeight: Typography.medium, fontFamily: 'System' },

  details: {
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    gap: Spacing.xs,
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: Typography.sm, color: Colors.textSecondary, fontFamily: 'System' },
  detailValue: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.textPrimary, fontFamily: 'System' },
});
