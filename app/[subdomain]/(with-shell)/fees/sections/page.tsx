import { redirect } from "next/navigation";

type SectionFeesRedirectPageProps = {
  params: { subdomain: string };
};

export default async function SectionFeesRedirectPage({ params }: SectionFeesRedirectPageProps) {
  const { subdomain } = params;
  redirect(`/${subdomain}/fees?tab=class`);
}
