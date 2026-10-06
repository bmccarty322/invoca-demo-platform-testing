/* salesPath.ts — the NORMAL agent for a prospect, as a ChatBrain, built from the profile alone.
   -----------------------------------------------------------------------------
   The customer demo's agent has two paths: the sales path (exactly the agent an SE previews in
   Agent Studio: SMS qualify, quote and book; voice qualify and route) and the support path
   (engine/supportPrompt.ts). The staff app builds its brains inside React pages from the live
   effective config; a customer's snapshot is built on the server at share time, so this module
   does the same job from the saved profile, with no React and no browser. ⚠️ It is the
   NON-edited agent: customisations made with Ask AI on the preview pages are not in it.
   ============================================================================= */
import type { CustomerProfile } from "./schema.ts";
import type { ChatBrain, VoicePath } from "../../engine/chat.ts";
import { buildSmsBrain, resolveGreeting } from "./smsBrain.ts";
import { voiceSpecFor } from "./voiceAgentSpec.ts";
import { DEFAULT_ESCALATE_HANDLING, DEFAULT_SUPPORT_INTENT } from "./voiceAgentSpec.ts";

export function salesBrainFor(profile: CustomerProfile, channel: "sms" | "voice"): ChatBrain {
  const ac: any = profile.reports.agentConfig;
  if (channel === "sms") {
    const b: any = buildSmsBrain(profile as any, ac);
    return { ...b, customerName: profile.customerName, industry: profile.industry } as ChatBrain;
  }
  const spec = voiceSpecFor(profile);
  /* The sales branches only: the support side is the other path of this agent. */
  const sales: VoicePath[] = spec?.useCases?.sales?.length
    ? [{
        intent: "Sales Inquiry",
        recognise: (spec.intent ?? "").split("\n")[0] || undefined,
        routes: spec.useCases.sales.map((u) => ({
          team: (u.route ?? u.title).trim(),
          need: u.title.trim(),
          action: "Qualify, then route them",
          collect: u.collect,
        })),
      }]
    : [];
  const q = profile.reports.voiceRoutingDemo?.queues ?? [];
  return {
    customerName: profile.customerName,
    industry: profile.industry,
    rules: ac?.brandConversationRules ?? [],
    qaPairs: ac?.aiRecommendations?.find((r: any) => r.qaPairs?.length)?.qaPairs ?? [],
    knowledge: ac?.knowledgeSources?.map((k: any) => k.name) ?? [],
    playbook: ac?.smsPlaybook,
    serviceArea: ac?.serviceArea,
    voicePaths: sales,
    voiceMinimal: false,
    voiceBooking: false,
    serviceZips: spec?.serviceZips,
    outOfAreaScript: spec?.outOfAreaScript,
    voiceRules: spec?.rules,
    voiceSteps: spec?.informSteps,
    voiceEscalate: spec?.escalateHandling && spec.escalateHandling !== DEFAULT_ESCALATE_HANDLING ? spec.escalateHandling : undefined,
    voiceSupportIntent: spec?.supportIntent && spec.supportIntent !== DEFAULT_SUPPORT_INTENT ? spec.supportIntent : undefined,
    voiceRouting: q.length ? {
      newQueue: q[0]?.name ?? "the new enquiries team",
      supportQueue: q[1]?.name ?? "the support team",
      generalQueue: q[2]?.name,
      bookingTerm: profile.bookingTerm,
      products: profile.reports.marketingDashboard?.breakdowns?.find((b) => /Product Category/i.test(b.title))?.rows.map((x) => x.name),
      who: "customer",
    } : undefined,
  } as ChatBrain;
}

export { resolveGreeting };
