import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Port of src/modules/scenarioeditor/ScenarioNotFoundPage.vue. */
@Component({
  selector: 'app-scenario-not-found',
  imports: [RouterLink],
  template: `
    <main class="bg-background grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
      <div class="text-center">
        <p class="text-primary text-base font-semibold">404</p>
        <h1 class="text-foreground mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
          Scenario not found
        </h1>
        <p class="text-muted-foreground mt-6 max-w-md text-base leading-7">
          Sorry, we could not find the scenario you were looking for. It may have been deleted or it
          does not exists in this browser.
        </p>
        <div class="mt-10 flex items-center justify-center gap-x-8">
          <a routerLink="/" class="text-primary text-sm font-semibold"
            ><span aria-hidden="true">&larr;</span> Back to home</a
          >
          <a
            href="https://docs.orbat-mapper.app/guide/storage"
            class="text-foreground text-sm font-semibold"
            >Documentation <span aria-hidden="true">&rarr;</span></a
          >
        </div>
      </div>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
})
export class ScenarioNotFound {}
