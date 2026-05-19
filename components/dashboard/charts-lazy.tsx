"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const ChartSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-5 w-40" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-64 w-full" />
    </CardContent>
  </Card>
);

export const AllocationChart = dynamic(
  () =>
    import("./AllocationChart").then((m) => ({ default: m.AllocationChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

export const ExpenseTrend = dynamic(
  () => import("./ExpenseTrend").then((m) => ({ default: m.ExpenseTrend })),
  { loading: () => <ChartSkeleton />, ssr: false }
);
