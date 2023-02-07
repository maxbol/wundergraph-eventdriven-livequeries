import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import { GraphQLLiveDirective } from "@n1ru4l/graphql-live-query";
import { baseData } from "./data";
import { events } from "./events";

const DriverType = new GraphQLObjectType({
  name: "Driver",
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
});

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      drivers: {
        type: new GraphQLNonNull(new GraphQLList(DriverType)),
        resolve: () => baseData.drivers,
      },
    },
  }),
  subscription: new GraphQLObjectType({
    name: "Subscription",
    fields: {
      driversSubscription: {
        type: new GraphQLNonNull(new GraphQLList(DriverType)),
        async *subscribe() {
          yield { driversSubscription: baseData.drivers };

          for await (const _ of events) {
            yield { driversSubscription: baseData.drivers };
          }
        }
      },
    },
  }),
  directives: [GraphQLLiveDirective],
});
