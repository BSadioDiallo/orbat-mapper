import type { Routes } from '@angular/router';
import { leaveScenarioGuard } from './features/editor/leave-scenario.guard';

/** The routes of src/router/index.ts. Screens not ported yet are listed in KNOWN_GAPS.md. */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/landing/landing-page').then((m) => m.LandingPage),
  },
  {
    path: 'scenario/:scenarioId',
    loadComponent: () =>
      import('./features/editor/scenario-editor-page').then((m) => m.ScenarioEditorPage),
    canDeactivate: [leaveScenarioGuard],
  },
  {
    path: 'newscenario',
    loadComponent: () =>
      import('./features/new-scenario/new-scenario-page').then((m) => m.NewScenarioPage),
  },
  { path: 'scenario/:scenarioId/maplibre', redirectTo: 'scenario/:scenarioId' },
  { path: 'scenario/:scenarioId/legacy', redirectTo: 'scenario/:scenarioId' },
  { path: 'globe/:scenarioId', redirectTo: 'scenario/:scenarioId' },
  { path: '**', redirectTo: '' },
];
