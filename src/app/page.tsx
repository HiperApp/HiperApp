import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import SplashRedirect from "@/components/SplashRedirect";

export default async function SplashPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let destino: string;

  if (user) {
    destino = "/dashboard";
  } else {
    const onboardingVisto = cookies().get("hiperapp_onboarding_visto");
    destino = onboardingVisto ? "/login" : "/onboarding";
  }

  return <SplashRedirect destino={destino} />;
}
