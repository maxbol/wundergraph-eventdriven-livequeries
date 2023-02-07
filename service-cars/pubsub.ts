import { InMemoryLiveQueryStore } from "@n1ru4l/in-memory-live-query-store";
import Redis from "ioredis";
import { EVENT_CARDRIVERCHANGE } from "./constants";
import { controller } from "./events";
import { baseData } from "./data";
import { CarDriverChange } from "./types";

export const publisher = new Redis();
export const subscriber = new Redis();

export const liveQueryStore = new InMemoryLiveQueryStore();

export function randomDriverChange() {
  const driverIds = Array.from(
    new Set(baseData.cars.map((car) => car.driverId))
  );

  if (driverIds.length === 1) {
    return;
  }

  const car =
    baseData.cars[Math.round(Math.random() * (baseData.cars.length - 1))];
  const driverId = driverIds[Math.round(Math.random() * (driverIds.length - 1))];

  if (car.driverId === driverId) {
    randomDriverChange();
  }

  car.driverId = driverId;

  const change: CarDriverChange = {
    carId: car.id,
    driverId: car.driverId
  };

  return publisher.publish(EVENT_CARDRIVERCHANGE, JSON.stringify(change));
}

subscriber.on("message", (_: string, data: any) => {
  const parsedData: CarDriverChange = JSON.parse(data);
  liveQueryStore.invalidate(`Car:${parsedData.carId.toString()}`);
  controller.emit(EVENT_CARDRIVERCHANGE, parsedData);
});

subscriber.subscribe(EVENT_CARDRIVERCHANGE);
