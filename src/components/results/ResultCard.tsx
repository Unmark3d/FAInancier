import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
} from 'react-native';
import { CalculationResult } from '../../engine/types';
import { Card } from '../ui/Card';
import { ScoreRing } from '../ui/ScoreRing';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import { formatEUR, formatPct, formatPeriod } from '../../utils/format';

interface ResultCardProps {
  result: CalculationResult;
  rank: number;
  onPress: () => void;
  showSavings?: boolean;
  isRefinance?: boolean;
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

export function ResultCard({
  result,
  rank,
  onPress,
  showSavings = true,
  isRefinance = false,
}: ResultCardProps) {
  const [expanded, setExpanded] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const {
    product,
    loanAmount,
    monthlyPayment,
    dae,
    totalCost,
    totalInterest,
    eligibility,
    scenarios,
    savingsVsAverage,
    monthlySavings,
    totalSavings,
    currentMonthlyPayment,
  } = result;

  const isTop = rank === 1;
  const hasMonthlySavings = isRefinance && monthlySavings !== undefined;
  const isGoodRefinance = hasMonthlySavings && (monthlySavings ?? 0) > 0;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <Card elevated={isTop} style={[styles.card, isTop && styles.cardTop]}>

          {/* Top badge */}
          {isTop && !isRefinance && (
            <View style={styles.topBadge}>
              <Text style={styles.topBadgeText}>⭐ Cea mai bună ofertă</Text>
            </View>
          )}
          {isTop && isRefinance && isGoodRefinance && (
            <View style={[styles.topBadge, { backgroundColor: Colors.accentLight }]}>
              <Text style={[styles.topBadgeText, { color: Colors.accent }]}>
                💸 Economie maximă
              </Text>
            </View>
          )}

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.bankInfo}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{rank}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bankName} numberOfLines={1}>{product.bankName}</Text>
                <Text style={styles.productName} numberOfLines={1}>{product.productName}</Text>
              </View>
            </View>
            <ScoreRing score={result.recommendationScore} size={56} />
          </View>

          {/* Interest type pill */}
          <View
            style={[
              styles.typePill,
              { backgroundColor: INTEREST_TYPE_COLOR[product.interestType] + '18' },
            ]}
          >
            <View style={[styles.typeDot, { backgroundColor: INTEREST_TYPE_COLOR[product.interestType] }]} />
            <Text style={[styles.typeText, { color: INTEREST_TYPE_COLOR[product.interestType] }]}>
              {INTEREST_TYPE_LABEL[product.interestType]}
              {product.interestType !== 'FIXED'
                ? ` · IRCC + ${product.irccMargin}%`
                : ` · ${formatPct(product.annualRate)}`}
            </Text>
          </View>

          {/* ── REFINANCE SAVINGS PANEL ── */}
          {hasMonthlySavings ? (
            <View style={[
              styles.refinancePanel,
              isGoodRefinance ? styles.refinancePanelGood : styles.refinancePanelBad,
            ]}>
              <View style={styles.refinanceCompare}>
                <View style={styles.refinanceCol}>
                  <Text style={styles.refinanceLabel}>Rată actuală</Text>
                  <Text style={[styles.refinanceValue, styles.refinanceOld]}>
                    {formatEUR(currentMonthlyPayment ?? 0)}/lună
                  </Text>
                </View>
                <Text style={styles.refinanceArrow}>→</Text>
                <View style={styles.refinanceCol}>
                  <Text style={styles.refinanceLabel}>Rată nouă</Text>
                  <Text style={[
                    styles.refinanceValue,
                    isGoodRefinance ? styles.refinanceNew : styles.refinanceNewBad,
                  ]}>
                    {formatEUR(monthlyPayment)}/lună
                  </Text>
                </View>
              </View>

              {isGoodRefinance ? (
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsBadgeText}>
                    ↓ {formatEUR(monthlySavings!)}/lună · total {formatEUR(totalSavings ?? 0)}
                  </Text>
                </View>
              ) : (
                <Text style={styles.noSavingsText}>
                  ⚠️ Rata ar crește cu {formatEUR(Math.abs(monthlySavings ?? 0))}/lună față de creditul actual
                </Text>
              )}
            </View>
          ) : null}

          {/* ── KEY METRICS ── */}
          <View style={styles.metricsGrid}>
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
              label="Sumă împrumutată"
              value={formatEUR(loanAmount)}
            />
            <MetricCell
              label="Cost total"
              value={formatEUR(totalCost, 0)}
            />
          </View>

          {/* Variable scenarios */}
          {scenarios && (
            <View style={styles.scenarios}>
              <Text style={styles.scenariosTitle}>Scenarii IRCC (±2%):</Text>
              <View style={styles.scenariosRow}>
                <ScenarioPill label="Optimist" value={formatEUR(scenarios.optimistic.monthlyPayment)} color={Colors.success} />
                <ScenarioPill label="Neutru" value={formatEUR(scenarios.neutral.monthlyPayment)} color={Colors.warning} />
                <ScenarioPill label="Pesimist" value={formatEUR(scenarios.pessimistic.monthlyPayment)} color={Colors.error} />
              </View>
            </View>
          )}

          {/* Savings vs average (non-refinance) */}
          {showSavings && !isRefinance && savingsVsAverage !== undefined && savingsVsAverage > 0 && (
            <View style={styles.savingsVsAvg}>
              <Text style={styles.savingsVsAvgText}>
                💰 {formatEUR(savingsVsAverage)} sub media pieței
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
          <TouchableOpacity
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setExpanded(!expanded);
            }}
            style={styles.expandBtn}
            hitSlop={{ top: 8, bottom: 8, left: 0, right: 0 }}
          >
            <Text style={styles.expandText}>
              {expanded ? '▲ Ascunde detalii' : '▼ Detalii costuri'}
            </Text>
          </TouchableOpacity>

          {expanded && (
            <View style={styles.details}>
              <DetailRow label="Dobândă totală" value={formatEUR(totalInterest)} />
              <DetailRow label="Asigurări totale" value={formatEUR(result.totalInsurance)} />
              <DetailRow label="Comision acordare" value={formatEUR(result.openingCost)} />
              <DetailRow label="DAE" value={formatPct(dae)} />
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
    </Animated.View>
  );
}

function MetricCell({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.metricCell}>
      <Text style={[styles.metricValue, highlight && styles.metricValueHighlight]}>
        {value}
      </Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function ScenarioPill({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={[styles.scenarioPill, { borderColor: color + '60' }]}>
      <Text style={[styles.scenarioPillLabel, { color }]}>{label}</Text>
      <Text style={[styles.scenarioPillValue, { color }]}>{value}</Text>
    </View>
  );
}

function DetailRow({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
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
    paddingVertical: 4,
    borderRadius: Radius.full,
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
    gap: Spacing.sm,
  },
  bankInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rankText: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.textSecondary,
    fontFamily: 'System',
  },
  bankName: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    fontFamily: 'System',
  },
  productName: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: 'System',
    marginTop: 1,
  },

  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
    gap: 5,
  },
  typeDot: { width: 7, height: 7, borderRadius: 4 },
  typeText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    fontFamily: 'System',
  },

  // ── Refinance panel ──────────────────────────────────
  refinancePanel: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  refinancePanelGood: { backgroundColor: Colors.accentLight },
  refinancePanelBad: { backgroundColor: Colors.warningLight },

  refinanceCompare: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  refinanceCol: { alignItems: 'center', flex: 1 },
  refinanceArrow: {
    fontSize: Typography.xl,
    color: Colors.textMuted,
    marginHorizontal: Spacing.xs,
  },
  refinanceLabel: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    fontFamily: 'System',
    marginBottom: 3,
  },
  refinanceValue: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    fontFamily: 'System',
  },
  refinanceOld: { color: Colors.textSecondary, textDecorationLine: 'line-through' },
  refinanceNew: { color: Colors.accent },
  refinanceNewBad: { color: Colors.warning },

  savingsBadge: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    alignSelf: 'center',
  },
  savingsBadgeText: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.textInverse,
    fontFamily: 'System',
  },
  noSavingsText: {
    fontSize: Typography.xs,
    color: Colors.warning,
    fontFamily: 'System',
    textAlign: 'center',
  },

  // ── Metrics grid ─────────────────────────────────────
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  metricCell: {
    alignItems: 'center',
    width: '50%',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.xs,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  metricValue: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    fontFamily: 'System',
    textAlign: 'center',
  },
  metricValueHighlight: { color: Colors.primary, fontSize: Typography.md },
  metricLabel: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
    fontFamily: 'System',
  },

  // ── Scenarios ─────────────────────────────────────────
  scenarios: { marginBottom: Spacing.sm },
  scenariosTitle: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontFamily: 'System',
  },
  scenariosRow: { flexDirection: 'row', gap: Spacing.xs },
  scenarioPill: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: 4,
  },
  scenarioPillLabel: { fontSize: 10, fontFamily: 'System' },
  scenarioPillValue: { fontSize: Typography.xs, fontWeight: Typography.semibold, fontFamily: 'System' },

  // ── Savings vs average ────────────────────────────────
  savingsVsAvg: {
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  savingsVsAvgText: {
    fontSize: Typography.sm,
    color: Colors.accent,
    fontWeight: Typography.semibold,
    fontFamily: 'System',
  },

  // ── Ineligible ────────────────────────────────────────
  ineligible: {
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  ineligibleTitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.warning,
    fontFamily: 'System',
    marginBottom: 2,
  },
  ineligibleReason: { fontSize: Typography.xs, color: Colors.warning, fontFamily: 'System' },

  // ── Expand ────────────────────────────────────────────
  expandBtn: { alignItems: 'center', paddingTop: Spacing.sm },
  expandText: {
    fontSize: Typography.xs,
    color: Colors.primary,
    fontWeight: Typography.medium,
    fontFamily: 'System',
  },

  details: {
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    gap: Spacing.xs + 2,
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: Typography.sm, color: Colors.textSecondary, fontFamily: 'System' },
  detailValue: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.textPrimary,
    fontFamily: 'System',
  },
});
