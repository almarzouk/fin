"use client";

import { PortfolioPanel } from "@/components/investments/PortfolioPanel";
import { SavingsPlansList } from "@/components/investments/SavingsPlansList";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function InvestmentsPage() {
  const { t } = useLocale();

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">{t.investments.title}</h2>
      <section className="grid gap-6 lg:grid-cols-2">
        <PortfolioPanel />
        <SavingsPlansList />
      </section>
    </section>
  );
}
