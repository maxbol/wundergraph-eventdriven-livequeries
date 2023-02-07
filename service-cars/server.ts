import { envelop, useEngine, useSchema } from "@envelop/core";
import Express from "express";
import {
  Request,
  getGraphQLParameters,
  processRequest,
  renderGraphiQL,
  sendResult,
  shouldRenderGraphiQL,
} from "graphql-helix";
import { schema } from "./schema";
import * as GraphQLJS from 'graphql'
import { liveQueryStore, randomDriverChange } from "./pubsub";

const getExecutionLibrary = envelop({
  plugins: [
    useSchema(schema),
    useEngine(GraphQLJS)
  ]
});

setInterval(randomDriverChange, 1000);

async function handleGraphql(req: Express.Request, res: Express.Response) {
  const { parse, validate, execute, schema } = getExecutionLibrary({ req });

  const request: Request = {
    body: req.body,
    headers: req.headers,
    method: req.method,
    query: req.query,
  };

  if (shouldRenderGraphiQL(request)) {
    res.send(
      renderGraphiQL({
        shouldPersistHeaders: true,
      })
    );
  } else {
    console.debug(`[HTTP-SSE] Opening connection`);

    const { operationName, query, variables } = getGraphQLParameters(request);

    const result = await processRequest({
      execute: liveQueryStore.makeExecute(execute),
      operationName,
      parse,
      query,
      request,
      schema,
      validate,
      variables,
    });

    sendResult(result, res);

    res.on("close", () => {
      console.debug(`[HTTP-SSE] Closing connection`);
    });
  }
}

const app = Express();

app.use(Express.json());

app.use("/graphql", handleGraphql);

const PORT = 4001;

app.listen(PORT, () => {
  console.log(`Started cars service on port ${PORT}...`);
});
