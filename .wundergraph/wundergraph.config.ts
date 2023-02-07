import { configureWunderGraphApplication, cors, introspect, templates } from '@wundergraph/sdk';
import server from './wundergraph.server';
import operations from './wundergraph.operations';

const cars = introspect.graphql({
	apiNamespace: 'cars',
	url: 'http://localhost:4001/graphql',
	subscriptionsURL: 'http://localhost:4001/graphql',
	subscriptionsUseSSE: true
});

const drivers = introspect.graphql({
	apiNamespace: 'drivers',
	url: 'http://localhost:4002/graphql',
	subscriptionsURL: 'http://localhost:4002/graphql',
	subscriptionsUseSSE: true
});

// configureWunderGraph emits the configuration
configureWunderGraphApplication({
	apis: [cars, drivers],
	server,
	operations,
	codeGenerators: [
		{
			templates: [
				// use all the typescript react templates to generate a client
				...templates.typescript.all,
			],
		},
	],
	cors: {
		...cors.allowAll,
		allowedOrigins: [],
	},
	dotGraphQLConfig: {
		hasDotWunderGraphDirectory: false,
	},
	security: {
		enableGraphQLEndpoint: process.env.NODE_ENV !== 'production' || process.env.GITPOD_WORKSPACE_ID !== undefined,
	},
});
