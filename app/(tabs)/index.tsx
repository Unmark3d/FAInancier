import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../src/theme';

const SCENARIOS = [
  {
    id: 'a',
    emoji: '🏡',
    title: 'Știu cât vreau să împrumut',
    subtitle: 'Calculează rata lunară și costul total pentru fiecare bancă',
    color: Colors.primary,
    bgColor: Colors.primaryLight,
    route: '/scenario/a',
  },
  {
    id: 'b',
    emoji: '💳',
    title: 'Știu cât pot plăti lunar',
    subtitle: 'Află suma maximă pe care o poți împrumuta în bugetul tău',
    color: Colors.accent,
    bgColor: Colors.accentLight,
    route: '/scenario/b',
  },
  {
    id: 'c',
    emoji: '🔄',
    title: 'Vreau să refinanțez',
    subtitle: 'Compară creditul actual cu ofertele de refinanțare din piață',
    color: Colors.warning,
    bgColor: Colors.warningLight,
    route: '/scenario/c',
  },
] as const;

const STATS = [
  { label: 'Bănci comparate', value: '8' },
  { label: 'Produse active', value: '16' },
  { label: 'IRCC curent', value: '5,86%' },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>🇷🇴 Credite imobiliare România</Text>
          </View>
          <Text style={styles.heroTitle}>
            Cel mai bun credit al tău,{'\n'}în câteva minute.
          </Text>
          <Text style={styles.heroSubtitle}>
            Compară ofertele de credit ipotecar de la toate băncile majore, personalizat pentru situația ta.
          </Text>
        </View>

        {/* Stats strip */}
        <View style={styles.statsRow}>
          {STATS.map((stat) => (
            <View key={stat.label} style={styles.statCell}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Scenarios */}
        <Text style={styles.sectionTitle}>Cu ce te pot ajuta?</Text>

        {SCENARIOS.map((scenario) => (
          <TouchableOpacity
            key={scenario.id}
            style={styles.scenarioCard}
            onPress={() => router.push(scenario.route as any)}
            activeOpacity={0.85}
          >
            <View style={[styles.scenarioIcon, { backgroundColor: scenario.bgColor }]}>
              <Text style={styles.scenarioEmoji}>{scenario.emoji}</Text>
            </View>
            <View style={styles.scenarioText}>
              <Text style={styles.scenarioTitle}>{scenario.title}</Text>
              <Text style={styles.scenarioSubtitle}>{scenario.subtitle}</Text>
            </View>
            <Text style={[styles.scenarioArrow, { color: scenario.color }]}>→</Text>
          </TouchableOpacity>
        ))}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ Informațiile prezentate sunt orientative. Datele se actualizează săptămânal. FAInancier nu oferă consultanță financiară în sens juridic.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.base, paddingBottom: Spacing['3xl'] },

  hero: { marginBottom: Spacing.xl },
  heroBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  heroBadgeText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.primary,
    fontFamily: 'System',
  },
  heroTitle: {
    fontSize: Typography['3xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    lineHeight: Typography['3xl'] * 1.2,
    marginBottom: Spacing.sm,
    fontFamily: 'System',
  },
  heroSubtitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    lineHeight: Typography.base * 1.6,
    fontFamily: 'System',
  },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statCell: { flex: 1, alignItems: 'center' },
  statValue: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.primary,
    fontFamily: 'System',
  },
  statLabel: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
    fontFamily: 'System',
  },

  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    fontFamily: 'System',
  },

  scenarioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
    gap: Spacing.md,
  },
  scenarioIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scenarioEmoji: { fontSize: 26 },
  scenarioText: { flex: 1 },
  scenarioTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    fontFamily: 'System',
    marginBottom: 3,
  },
  scenarioSubtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sm * 1.4,
    fontFamily: 'System',
  },
  scenarioArrow: { fontSize: 22, fontWeight: Typography.bold },

  disclaimer: {
    marginTop: Spacing.xl,
    padding: Spacing.md,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
  },
  disclaimerText: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    lineHeight: Typography.xs * 1.6,
    fontFamily: 'System',
  },
});
