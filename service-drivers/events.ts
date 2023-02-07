import EventEmitter from "events"
import * as ai from "ix/asynciterable";
import { fromEvent } from "rxjs";
import { EVENT_CARDRIVERCHANGE } from "./constants";
import { CarDriverChange } from "./types";

export const controller = new EventEmitter();

export const events = ai.from(
  fromEvent<CarDriverChange>(controller, EVENT_CARDRIVERCHANGE)
);