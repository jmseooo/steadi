import { notFound } from "next/navigation";
import MomentDetail from "@/components/growth/MomentDetail";
import { getMoment, getMoments } from "@/lib/data";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getMoments()).map((m) => ({ slug: m.slug }));
}

export default async function MomentPage({ params }: PageProps<"/growth/moments/[slug]">) {
  const { slug } = await params;
  const found = await getMoment(slug);
  if (!found) notFound();
  return <MomentDetail moment={found.moment} cards={found.cards} />;
}
