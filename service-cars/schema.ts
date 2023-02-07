import {
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import { GraphQLLiveDirective } from "@n1ru4l/graphql-live-query";
import { baseData } from "./data";
import { events } from "./events";

const CarType = new GraphQLObjectType({
  name: "Car",
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    driverId: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
});

function getCarsByDriverId(driverId: number) {
  return baseData.cars.filter((item) => {
    return item.driverId === driverId;
  });
}

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      carsByDriver: {
        args: {
          driverId: {
            type: new GraphQLNonNull(GraphQLInt),
          },
        },
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(CarType))),
        resolve: (_: null, { driverId }: { driverId: number }) =>
          getCarsByDriverId(driverId),
      },
    },
  }),
  subscription: new GraphQLObjectType({
    name: "Subscription",
    fields: {
      carsByDriverSubscription: {
        args: {
          driverId: {
            type: new GraphQLNonNull(GraphQLInt),
          },
        },
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(CarType))),
        async *subscribe(
          _: null,
          { driverId }: { driverId: number }
        ) {
          yield { carsByDriverSubscription: getCarsByDriverId(driverId) };

          for await (const event of events) {
            if (event.driverId === driverId) {
              yield { carsByDriverSubscription: getCarsByDriverId(driverId) };
            }
          }
        },
      },
    },
  }),
  directives: [GraphQLLiveDirective],
});
