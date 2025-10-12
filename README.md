# Mobilabonnement kalkulator

Dette prosjektet inneholder et enkelt Python-verktøy for å beregne
månedskostnaden til et mobilabonnement basert på faktisk bruk.

## Kom i gang

1. Sørg for at du har Python 3.8 eller nyere installert.
2. Kjør kalkulatoren fra kommandolinjen:

   ```bash
   python mobile_plan_calculator.py PLAN DATA_GB MINUTTER SMS [--detailed]
   ```

   Eksempel som viser en detaljert oversikt for Standard-abonnementet:

   ```bash
   python mobile_plan_calculator.py Standard 7.5 650 200 --detailed
   ```

## Planer

Kalkulatoren leveres med tre forhåndsdefinerte abonnementer:

| Plan      | Grunnpris | Inkludert data | Inkluderte minutter | Inkluderte SMS |
| --------- | --------- | -------------- | ------------------- | -------------- |
| Mini      | 199 kr    | 1 GB           | 100                 | 100            |
| Standard  | 329 kr    | 5 GB           | 500                 | 500            |
| Familie   | 499 kr    | 15 GB          | 2000                | 2000           |

Overforbruk faktureres etter satsene som er definert i
`mobile_plan_calculator.py`.

## Testing

Verktøyet har ingen automatiske tester, men du kan validere resultatet ved å
kjøre scriptet med forskjellige kombinasjoner av data, minutter og SMS.
