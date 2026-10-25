import { notFound } from "next/navigation";
import MomentDetail from "@/components/growth/MomentDetail";
import { MOMENTS } from "@/components/growth/moments";

export const dynamicParams = false;

export function generateStaticParams() {
  return MOMENTS.map((m) => ({ slug: m.slug }));
}

export default async function MomentPage({ params }: PageProps<"/growth/moments/[slug]">) {
  const { slug } = await params;
  const moment = MOMENTS.find((m) => m.slug === slug);
  if (!moment) notFound();
  return <MomentDetail moment={moment} />;
}
