import type { CanDeactivateFn } from '@angular/router';
import type { ScenarioEditorPage } from './scenario-editor-page';

/**
 * `onBeforeRouteLeave` / `onBeforeRouteUpdate` of ScenarioEditorWrapper.vue: asks before leaving a
 * scenario with unsaved changes; moving between child views of the same scenario is free.
 */
export const leaveScenarioGuard: CanDeactivateFn<ScenarioEditorPage> = async (
  component,
  currentRoute,
  _currentState,
  nextState,
) => {
  const currentId = currentRoute.paramMap.get('scenarioId');
  const nextPath = nextState?.url ?? '';
  if (currentId && nextPath.startsWith(`/scenario/${currentId}`)) return true;
  return component.confirmNavigationAway();
};
