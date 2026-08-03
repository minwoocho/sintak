import data from '$lib/data/oracles.json';
import { demoEvents } from '$lib/data/demo';
import type { PageLoad } from './$types';
import type { OracleEvent } from '$lib/types';

export const prerender = true;
export const load:PageLoad=()=>{
  const dataset=data as {updatedAt:string|null;events:OracleEvent[]};
  const events=dataset.events.length?dataset.events:demoEvents;
  return {events,source:dataset.events.length?'live':'demo',updatedAt:dataset.updatedAt};
};
