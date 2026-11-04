/** The demo scenarios of src/views/DemoScenarioCards.vue (files under public/scenarios/). */
export const DEMO_SCENARIOS = [
  {
    name: 'The Falklands War 1982',
    id: 'falkland82',
    summary:
      'The Falklands War was a military conflict that took place in 1982 between Argentina and the United Kingdom. Argentina invaded the Falkland Islands on April 2, 1982, and the UK responded by sending a task force to retake the islands.',
    imageUrl: '/scenarios/images/HMS_Broadsword_and_Hermes_1982_IWM.jpg',
    aiGenerated: false,
  },
  {
    name: 'Battles of Narvik 1940',
    id: 'narvik40',
    summary:
      'A series of naval and land engagements fought between German and Allied forces from April to June 1940. The battles marked the first Allied victory against Germany in the war.',
    imageUrl: '/scenarios/images/Norwegian_Army_Colt_heavy_machine_gun_at_the_Narvik_front.jpg',
    aiGenerated: false,
  },
  {
    name: 'Northern Storm 1985',
    id: 'northernstorm85',
    summary:
      'A fictional NATO–Warsaw Pact war in June 1985, inspired by Red Storm Rising. Land, air, sea and subsurface forces from the inner German border to Iceland and the North Atlantic. Made to test and showcase features.',
    imageUrl: '/scenarios/images/northern-storm-85.svg',
    aiGenerated: true,
  },
] as const;
