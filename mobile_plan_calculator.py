"""Command line mobile subscription cost calculator.

This module exposes a simple calculator to estimate the monthly price of
predefined mobile plans. The calculator can be used as a library and also
provides a command line interface via ``python mobile_plan_calculator.py``.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict
import argparse


@dataclass(frozen=True)
class Plan:
    """Represents the cost structure of a mobile subscription plan."""

    base_price: float
    included_data_gb: float
    data_overage_per_gb: float
    included_minutes: int
    minute_overage_price: float
    included_sms: int
    sms_overage_price: float

    def calculate_cost(self, *, data_gb: float, minutes: int, sms: int) -> Dict[str, float]:
        """Return a breakdown of the monthly cost for the provided usage.

        Args:
            data_gb: Total data usage for the month (in gigabytes).
            minutes: Voice minutes used during the month.
            sms: Number of text messages sent during the month.

        Returns:
            A dictionary with detailed pricing for the base plan and any
            overages.
        """

        data_overage_gb = max(0.0, data_gb - self.included_data_gb)
        minute_overage = max(0, minutes - self.included_minutes)
        sms_overage = max(0, sms - self.included_sms)

        data_overage_cost = data_overage_gb * self.data_overage_per_gb
        minute_overage_cost = minute_overage * self.minute_overage_price
        sms_overage_cost = sms_overage * self.sms_overage_price

        total = self.base_price + data_overage_cost + minute_overage_cost + sms_overage_cost
        return {
            "base_price": round(self.base_price, 2),
            "data_overage_cost": round(data_overage_cost, 2),
            "minute_overage_cost": round(minute_overage_cost, 2),
            "sms_overage_cost": round(sms_overage_cost, 2),
            "total": round(total, 2),
        }


PLANS: Dict[str, Plan] = {
    "Mini": Plan(
        base_price=199,
        included_data_gb=1,
        data_overage_per_gb=99,
        included_minutes=100,
        minute_overage_price=1.2,
        included_sms=100,
        sms_overage_price=0.75,
    ),
    "Standard": Plan(
        base_price=329,
        included_data_gb=5,
        data_overage_per_gb=79,
        included_minutes=500,
        minute_overage_price=0.9,
        included_sms=500,
        sms_overage_price=0.6,
    ),
    "Familie": Plan(
        base_price=499,
        included_data_gb=15,
        data_overage_per_gb=59,
        included_minutes=2000,
        minute_overage_price=0.5,
        included_sms=2000,
        sms_overage_price=0.4,
    ),
}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Kalkuler månedskostnad for et mobilabonnement basert på bruk",
    )
    parser.add_argument(
        "plan",
        choices=sorted(PLANS.keys()),
        help="Navnet på abonnementet",
    )
    parser.add_argument(
        "data_gb",
        type=float,
        help="Data brukt i løpet av måneden (GB)",
    )
    parser.add_argument(
        "minutes",
        type=int,
        help="Antall ringeminutter brukt",
    )
    parser.add_argument(
        "sms",
        type=int,
        help="Antall SMS sendt",
    )
    parser.add_argument(
        "--detailed",
        action="store_true",
        help="Vis detaljert oversikt i tillegg til totalsummen",
    )
    return parser


def format_result(breakdown: Dict[str, float], detailed: bool) -> str:
    if not detailed:
        return f"Total månedskostnad: {breakdown['total']:.2f} kr"

    lines = ["Kostnadsoversikt:"]
    lines.append(f"  Grunnpris: {breakdown['base_price']:.2f} kr")
    lines.append(f"  Dataoverforbruk: {breakdown['data_overage_cost']:.2f} kr")
    lines.append(f"  Minutter over inkludert: {breakdown['minute_overage_cost']:.2f} kr")
    lines.append(f"  SMS over inkludert: {breakdown['sms_overage_cost']:.2f} kr")
    lines.append(f"  Totalt: {breakdown['total']:.2f} kr")
    return "\n".join(lines)


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    plan = PLANS[args.plan]
    breakdown = plan.calculate_cost(
        data_gb=args.data_gb,
        minutes=args.minutes,
        sms=args.sms,
    )

    print(format_result(breakdown, args.detailed))


if __name__ == "__main__":
    main()
