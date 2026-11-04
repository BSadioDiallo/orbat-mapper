/**
 * Replaces `@/composables/scenarioUtils` for the shared code reused by Angular (for instance
 * src/modules/scenarioeditor/scenarioEvents.ts). Upstream, `useActiveScenario` injects the
 * scenario provided by a Vue component; here the active scenario is the shared global one that
 * `ScenarioService` exposes. Only the function that reused modules need is provided: a module
 * that imports another export fails to compile, which shows what to add.
 */
import { useScenario } from '@/scenariostore';

export function useActiveScenario() {
  return useScenario().scenario.value;
}
