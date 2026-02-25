import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../src/store/useAppStore';
import { getBankProducts } from '../../src/data/bankProducts';
import { runScenarioA } from '../../src/engine/calculator';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { SliderInput } from '../../src/components/ui/SliderInput';
import { Colors, Typography, Spacing, Radius } from '../../src/theme';
import { formatEUR, formatPeriod, parseNumber } from '../../src/utils/format';

export default function ScenarioAScreen() {
  const router = useRouter();
  const { scenarioAInput, setScenarioAInput, weights, setResults, setActiveScenario } = useAppStore();

  const [propertyValue, setPropertyValue] = useState(String(scenarioAInput.propertyValue ?? 100000));
  const [downPayment, setDownPayment] = useState(String(scenarioAInput.downPayment ?? 20000));
  const [periodMonths, setPeriodMonths] = useState(scenarioAInput.periodMonths ?? 300);
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [existingDebts, setExistingDebts] = useState('');
  const [userAge, setUserAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const propVal = parseNumber(propertyValue);
  const downPay = parseNumber(downPayment);
  const loanAmount = propVal - downPay;
  const ltv = propVal > 0 ? (loanAmount / propVal) * 100 : 0;

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (propVal < 20_000) errs.propertyValue = 'Valoare minimă: 20.000 EUR';
    if (downPay < 0) errs.downPayment = 'Avansul nu poate fi negativ';
    if (downPay >= propVal) errs.downPayment = 'Avansul nu poate depăși valoarea proprietății';
    if (loanAmount < 5_000) errs.downPayment = 'Suma finanțată prea mică (min 5.000 EUR)';
    if (periodMonths < 60 || periodMonths > 360) errs.period = 'Perioada: 5-30 ani';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleCalculate() {
    if (!validate()) return;
    setLoading(true);

    const input = {
      propertyValue: propVal,
      downPayment: downPay,
      periodMonths,
      monthlyIncome: monthlyIncome ? parseNumber(monthlyIncome) : undefined,
      existingDebts: existingDebts ? parseNumber(existingDebts) : undefined,
      userAge: userAge ? parseInt(userAge, 10) : undefined,
    };

    setScenarioAInput(input);

    setTimeout(() => {
      const products = getBankProducts();
      const results = runScenarioA(input, products, weights);
      setResults(results);
      setActiveScenario('A');
      setLoading(false);
      router.push('/results');
    }, 0);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.description}>
            Introdu valoarea proprietății și avansul disponibil pentru a vedea toate ofertele eligibile.
          </Text>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Detalii proprietate</Text>

            <Input
              label="Valoarea proprietății"
              value={propertyValue}
              onChangeText={setPropertyValue}
              suffix="EUR"
              placeholder="ex: 100.000"
              error={errors.propertyValue}
              keyboardType="numeric"
            />
            <Input
              label="Avans disponibil"
              value={downPayment}
              onChangeText={setDownPayment}
              suffix="EUR"
              placeholder="ex: 20.000"
              error={errors.downPayment}
              keyboardType="numeric"
            />

            {loanAmount > 0 && (
              <View style={styles.loanSummary}>
                <View style={styles.loanRow}>
                  <Text style={styles.loanLabel}>Suma finanțată</Text>
                  <Text style={styles.loanValue}>{formatEUR(loanAmount)}</Text>
                </View>
                <View style={styles.loanRow}>
                  <Text style={styles.loanLabel}>LTV (avans %)</Text>
                  <Text style={[styles.loanValue, ltv > 85 && styles.loanValueWarn]}>
                    {ltv.toFixed(1)}% — avans {(100 - ltv).toFixed(1)}%
                  </Text>
                </View>
              </View>
            )}
          </Card>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Perioada creditului</Text>
            <SliderInput
              label="Durata"
              value={periodMonths}
              min={60}
              max={360}
              step={12}
              onValueChange={setPeriodMonths}
              formatValue={(v) => formatPeriod(v)}
              hint="Perioadele mai lungi = rate mai mici, cost total mai mare"
            />
            {errors.period && <Text style={styles.errorText}>{errors.period}</Text>}
          </Card>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Date pentru eligibilitate (opțional)</Text>
            <Text style={styles.optionalNote}>
              Completează pentru a verifica gradul de îndatorare BNR (max 40%)
            </Text>
            <Input
              label="Venit net lunar"
              value={monthlyIncome}
              onChangeText={setMonthlyIncome}
              suffix="EUR/lună"
              placeholder="ex: 2.000"
              keyboardType="numeric"
            />
            <Input
              label="Alte rate lunare existente"
              value={existingDebts}
              onChangeText={setExistingDebts}
              suffix="EUR/lună"
              placeholder="ex: 200"
              keyboardType="numeric"
            />
            <Input
              label="Vârsta"
              value={userAge}
              onChangeText={setUserAge}
              suffix="ani"
              placeholder="ex: 35"
              keyboardType="numeric"
              hint="Creditele nu pot depăși vârsta de 70 de ani"
            />
          </Card>

          <Button
            label={loading ? 'Se calculează...' : 'Compară ofertele →'}
            onPress={handleCalculate}
            loading={loading}
            fullWidth
            size="lg"
            style={{ marginTop: Spacing.sm }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: Spacing['4xl'] },
  description: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    lineHeight: Typography.base * 1.5,
    marginBottom: Spacing.lg,
    fontFamily: 'System',
  },
  card: { marginBottom: Spacing.md },
  sectionTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    fontFamily: 'System',
  },
  loanSummary: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  loanRow: { flexDirection: 'row', justifyContent: 'space-between' },
  loanLabel: { fontSize: Typography.sm, color: Colors.primary, fontFamily: 'System' },
  loanValue: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.primary, fontFamily: 'System' },
  loanValueWarn: { color: Colors.warning },
  optionalNote: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
    fontFamily: 'System',
  },
  errorText: {
    fontSize: Typography.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
    fontFamily: 'System',
  },
});
