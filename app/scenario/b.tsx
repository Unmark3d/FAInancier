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
import { runScenarioB } from '../../src/engine/calculator';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { SliderInput } from '../../src/components/ui/SliderInput';
import { Colors, Typography, Spacing, Radius } from '../../src/theme';
import { formatEUR, formatPeriod, parseNumber } from '../../src/utils/format';

export default function ScenarioBScreen() {
  const router = useRouter();
  const { weights, setResults, setActiveScenario } = useAppStore();

  const [maxPayment, setMaxPayment] = useState('500');
  const [periodMonths, setPeriodMonths] = useState(300);
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [existingDebts, setExistingDebts] = useState('');
  const [userAge, setUserAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const maxPayVal = parseNumber(maxPayment);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (maxPayVal < 100) errs.maxPayment = 'Rată minimă: 100 EUR/lună';
    if (maxPayVal > 50_000) errs.maxPayment = 'Rată maximă: 50.000 EUR/lună';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleCalculate() {
    if (!validate()) return;
    setLoading(true);

    setTimeout(() => {
      const products = getBankProducts();
      const results = runScenarioB(
        maxPayVal,
        periodMonths,
        products,
        monthlyIncome ? parseNumber(monthlyIncome) : undefined,
        existingDebts ? parseNumber(existingDebts) : undefined,
        userAge ? parseInt(userAge, 10) : undefined,
        weights,
      );
      setResults(results);
      setActiveScenario('B');
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
            Spune-ne cât poți plăti lunar și îți arătăm suma maximă pe care o poți împrumuta de la fiecare bancă.
          </Text>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Bugetul tău lunar</Text>
            <Input
              label="Rată lunară maximă"
              value={maxPayment}
              onChangeText={setMaxPayment}
              suffix="EUR/lună"
              placeholder="ex: 500"
              error={errors.maxPayment}
              keyboardType="numeric"
              hint="Suma totală pe care ești dispus să o plătești lunar (inclusiv asigurări)"
            />

            {maxPayVal > 0 && (
              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>💡 Estimare rapidă</Text>
                <Text style={styles.infoText}>
                  La {formatEUR(maxPayVal)}/lună pe {formatPeriod(periodMonths)},
                  îți poți permite aproximativ{' '}
                  <Text style={styles.infoHighlight}>
                    {formatEUR(maxPayVal * periodMonths * 0.7, 0)}
                  </Text>{' '}
                  credit (aprox. 70% din total plăți, restul = dobânzi/costuri).
                </Text>
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
              hint="O perioadă mai lungă permite o sumă mai mare împrumutată"
            />
          </Card>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Date suplimentare (opțional)</Text>
            <Input
              label="Venit net lunar"
              value={monthlyIncome}
              onChangeText={setMonthlyIncome}
              suffix="EUR/lună"
              placeholder="ex: 2.000"
              keyboardType="numeric"
              hint="Necesar pentru verificarea gradului de îndatorare BNR (40%)"
            />
            <Input
              label="Alte rate existente"
              value={existingDebts}
              onChangeText={setExistingDebts}
              suffix="EUR/lună"
              placeholder="ex: 100"
              keyboardType="numeric"
            />
            <Input
              label="Vârsta"
              value={userAge}
              onChangeText={setUserAge}
              suffix="ani"
              placeholder="ex: 35"
              keyboardType="numeric"
            />
          </Card>

          <Button
            label={loading ? 'Se calculează...' : 'Arată suma maximă →'}
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
  infoBox: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  infoTitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.primary,
    marginBottom: 4,
    fontFamily: 'System',
  },
  infoText: {
    fontSize: Typography.sm,
    color: Colors.primary,
    lineHeight: Typography.sm * 1.5,
    fontFamily: 'System',
  },
  infoHighlight: { fontWeight: Typography.bold },
});
