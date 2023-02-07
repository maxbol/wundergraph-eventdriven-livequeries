# Request: Allow for persistent connections in non-subscription GraphQL operations, allow passing on directives to GraphQL services across joins

## Goals

Currently, GraphQL subscriptions are the only allowed target for persistent connections over SSE in Wundergraph. However, alternate patterns for realtime data are emerging from the GraphQL community - for instance, Laurin Quasts [Live Query pattern](https://github.com/n1ru4l/graphql-live-query) (For clarification: This is NOT the same as Wundergraphs own Live query pattern which is based on backend polling cycles and not suitable in all cases). Nothing about these patterns violate the GraphQL RFC.

The services in this repo implements two parallell patterns for real time data, GraphQL subscriptions and Live queries. The test file showcases how GraphQL subscriptions are currently functioning as desired, while Live queries do not.

To make live queries work, it seems we have to:
* allow generated clients to set up persistent connections over Fetch/SSE, __for any type of operation.__
* make it possible to pass on some directive to __all__ subservices of a joint operation (at least if the goals below are believed to be attainable:)

### Realtime joins

In addition to allowing for realtime GraphQL data via Live query, it would be beneficial to be able to do realtime joins across services. Currently, all GraphQL service dependencies connected to the main operation through the `_join` field are automatically interpreted as (non-live) queries. As such, only the service resolving the root part of the operation would have the ability to invalidate it. However, it should be theoretically feasiblle to compose an operation using multiple realtime sources. It is my assertion that enabling this is a requirement to make feasible the use case of Live queries + multi service composition on the read side of a microservice system using Wundergraph on the edge.

## Requirements

Requires a local `redis` server to be running locally on a standard port.

## Service-level testing

To demonstrate the implementation of the live query pattern, start the services using `yarn start:services`  and open up the playground for the `cars` service (http://localhost:4001/graphql).

Running the following query should set up a SSE connection that produces new data every time it gets invalidated:

```graphql
query @live {
  a:carsByDriver(driverId:1){
    id
    name
    driverId
  }
  b:carsByDriver(driverId:2){
    id
    name
    driverId
  }
  c:carsByDriver(driverId:3){
    id
    name
    driverId
  }
  d:carsByDriver(driverId:4){
    id
    name
    driverId
  }
}
```

When first starting the services, each driver have at least one car connected to them. Every second, a car gets redistributed to a new driver with at least one more car connected to them, so that in the end a single driver holds all the cars. At this point, no more events should be sent.