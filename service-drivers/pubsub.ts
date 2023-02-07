import { InMemoryLiveQueryStore } from "@n1ru4l/in-memory-live-query-store";
import Redis from "ioredis";
import { EVENT_CARDRIVERCHANGE } from "./constants";
import { controller } from "./events";
import { CarDriverChange } from "./types";

export const subscriber = new Redis();

export const liveQueryStore = new InMemoryLiveQueryStore();

subscriber.on("message", (_: string, data: any) => {
  const parsedData: CarDriverChange = JSON.parse(data);
  liveQueryStore.invalidate(`Driver:${parsedData.driverId.toString()}`);
  controller.emit(EVENT_CARDRIVERCHANGE, parsedData);
});

subscriber.subscribe(EVENT_CARDRIVERCHANGE);