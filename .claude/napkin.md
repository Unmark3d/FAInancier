# Napkin Skill

Perform quick "napkin math" financial estimates and back-of-the-envelope calculations for FAInancier.

## What this skill does

Given a financial scenario or question, produce a concise, structured estimate with:
- Key assumptions listed upfront
- Step-by-step arithmetic shown clearly
- A bottom-line answer
- Sensitivity notes (what changes most if assumptions shift)

## Workflow

1. **Clarify the question** — restate what's being estimated in one sentence
2. **State assumptions** — list 3–7 key assumptions with rough values
3. **Do the math** — show each calculation step, using round numbers for readability
4. **Summarize** — give a single bottom-line number or range
5. **Sensitivity** — note which assumption most affects the result

## Output format

```
## Napkin: <scenario title>

**Estimating:** <one-sentence restatement>

### Assumptions
- <assumption 1>: <value>
- <assumption 2>: <value>
...

### Calculation
<step 1>: <formula> = <result>
<step 2>: <formula> = <result>
...

### Bottom line
~<final answer> (<range if uncertain>)

### Most sensitive to
<the assumption that swings the result most>
```

## Examples of use

- "Napkin: how much ARR do we need to raise a Series A?"
- "Napkin: CAC payback period given these unit economics"
- "Napkin: total addressable market for expense-tracking SaaS"
- "Napkin: break-even headcount for a $2M burn rate"
