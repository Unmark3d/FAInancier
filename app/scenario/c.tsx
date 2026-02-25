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
import { runScenarioC } from '../../src/engine/calculator';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { SliderInput } from '../../src/components/ui/SliderInput';
import { Colors, Typography, Spacing, Radius } from '../../src/theme';
import { formatEUR, formatPeriod, parseNumber } from '../../src/utils/format';

export default function ScenarioCScreen() {
  const router = useRouter();
  const { scenarioCInput, weights, setResults, setActiveScenario } = useAppStore();

  const [currentBalance, setCurrentBalance] = useState(String(scenarioCInput.currentBalance ?? 80000));
  const [currentPayment, setCurrentPayment] = useState(String(scenarioCInput.currentMonthlyPayment ?? 550));
  const [remainingMonths, setRemainingMonths] = useState(scenarioCInput.remainingMonths ?? 240);
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [userAge, setUserAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const balance = parseNumber(currentBalance);
  const payment = parseNumber(currentPayment);
  const currentRemainingCost = payment * remainingMonths;

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (balance < 5_000) errs.balance = 'Sold minim: 5.000 EUR';
    if (payment < 50) errs.payment = 'Rată minimă: 50 EUR/lună';
    if (payment >= balance) errs.payment = 'Rata lunară nu poate depăși soldul creditului';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleCalculate() {
    if (!validate()) return;
    setLoading(true);

    const input = {
      currentBalance: balance,
      currentMonthlyPayment: payment,
      remainingMonths,
      monthlyIncome: monthlyIncome ? parseNumber(monthlyIncome) : undefined,
      userAge: userAge ? parseInt(userAge, 10) : undefined,
    };

    setTimeout(() => {
      const products = getBankProducts();
      const results = runScenarioC(input, products, weights);
      setResults(results);
      setActiveScenario('C');
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
            Introdu datele creditului actual și compară-l cu ofertele de refinanțare disponibile pe piață.
          </Text>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Creditul actual</Text>
            <Input
              label="Sold curent"
              value={currentBalance}
              onChangeText={setCurrentBalance}
              suffix="EUR"
              placeholder="ex: 80.000"
              error={errors.balance}
              keyboardType="numeric"
              hint="Suma rămasă de plătit din creditul actual"
            />
            <Input
              label="Rată lunară actuală"
              value={currentPayment}
              onChangeText={setCurrentPayment}
              suffix="EUR/lună"
              placeholder="ex: 550"
              error={errors.payment}
              keyboardType="numeric"
              hint="Suma totală plătită lunar (rată + asigurări)"
            />
          </Card>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Perioada rămasă</Text>
            <SliderInput
              label="Luni rămase"
              value={remainingMonths}
              min={12}
              max={360}
              step={12}
              onValueChange={setRemainingMonths}
              formatValue={(v) => formatPeriod(v)}
              hint="Câte luni mai ai de plătit la creditul actual"
            />

            {balance > 0 && payment > 0 && (
              <View style={styles.currentCostBox}>
                <Text style={styles.costLabel}>Cost total rămas în scenariul actual:</Text>
                <Text style={styles.costValue}>{formatEUR(currentRemainingCost)}</Text>
                <Text style={styles.costNote}>
                  ({formatEUR(payment)}/lună × {remainingMonths} luni)
                </Text>
              </View>
            )}
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
            />
            <Input
              label="Vârsta"
              value={userAge}
              onChangeText={setUserAge}
              suffix="ani"
              placeholder="ex: 45"
              keyboardType="numeric"
            />
          </Card>

          <View style={styles.refinanceNote}>
            <Text style={styles.refinanceNoteTitle}>💡 Când merită refinanțarea?</Text>
            <Text style={styles.refinanceNoteText}>
              Refinanțarea este avantajoasă mai ales în primii ani ai creditului, când plătești preponderent dobândă. Economii semnificative apar când diferența de dobândă este cel puțin 0,5%.
            </Text>
          </View>

          <Button
            label={loading ? 'Se calculează...' : 'Calculează economiile →'}
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
  currentCostBox: {
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  costLabel: { fontSize: Typography.sm, color: Colors.warning, fontFamily: 'System' },
  costValue: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.warning,
    fontFamily: 'System',
    marginVertical: 4,
  },
  costNote: { fontSize: Typography.xs, color: Colors.warning, fontFamily: 'System' },
  refinanceNote: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  refinanceNoteTitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.primary,
    marginBottom: 6,
    fontFamily: 'System',
  },
  refinanceNoteText: {
    fontSize: Typography.sm,
    color: Colors.primary,
    lineHeight: Typography.sm * 1.5,
    fontFamily: 'System',
  },
});
