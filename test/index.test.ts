import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { ClientResponse } from '@wundergraph/sdk/client';
import fetch from 'node-fetch';
import { LiveJoinResponseData, LiveSimpleResponse, LiveSimpleResponseData } from '../.wundergraph/generated/models';
import { createTestServer } from '../.wundergraph/generated/testing';

const wg = createTestServer({ fetch: fetch as any });
beforeAll(() => wg.start());
afterAll(() => wg.stop());

describe('working tests', () => {
	test('NonLive simple operation returns data', async () => {
		const result = await wg.client().query(
			{
				operationName: 'NonLiveSimple',
			}
		);

		expect(result.error).toBeFalsy();
		expect(Array.isArray(result.data?.drivers)).toBe(true);
	});

	test('NonLive join operation returns data', async () => {
		const result = await wg.client().query(
			{
				operationName: 'NonLiveJoin',
			}
		);

		expect(result.error).toBeFalsy();
		expect(Array.isArray(result.data?.drivers)).toBe(true);
		expect(Array.isArray(result.data?.drivers[0].cars)).toBe(true);
	});

	test('Subscription simple operation returns data', (done) => {
		let responsesLeft = 10;

		wg.client().subscribe(
			{
				operationName: 'SubscriptionSimple',
				subscribeOnce: false,
				liveQuery: true
			},
			(result) => {
				console.log("got result", responsesLeft, result);
				expect(result.error).toBeFalsy();
				expect(Array.isArray(result.data?.drivers)).toBe(true);
				if (--responsesLeft < 1) {
					done();
				}
			}
		);
	});

	test('Subscription join operation returns data', (done) => {
		let responsesLeft = 10;

		wg.client().subscribe(
			{
				operationName: 'SubscriptionJoin',
				subscribeOnce: false,
				liveQuery: true
			},
			(result) => {
				console.log("got result", responsesLeft, result);
				expect(result.error).toBeFalsy();
				expect(Array.isArray(result.data?.drivers)).toBe(true);
				if (--responsesLeft < 1) {
					done();
				}
			}
		);
	});
});

describe('non-working tests', () => {
	test('Live simple operation returns data', (done) => {
		let responsesLeft = 10;

		wg.client().subscribe(
			{
				operationName: 'LiveSimple', // No subscription operation named this - how is this supposed to work for live queries?
				subscribeOnce: false,
				liveQuery: true
			} as never,
			(result: ClientResponse<LiveSimpleResponseData>) => {
				console.log("got result", responsesLeft, result);
				expect(result.error).toBeFalsy();
				expect(Array.isArray(result.data?.drivers)).toBe(true);
				if (--responsesLeft < 1) {
					done();
				}
			}
		);
	});
	
	test('Live join operation returns data', (done) => {
		let responsesLeft = 10;

		wg.client().subscribe(
			{
				operationName: 'LiveJoin', // No subscription operation named this - how is this supposed to work for live queries?
				subscribeOnce: false,
				liveQuery: true
			} as never,
			(result: ClientResponse<LiveJoinResponseData>) => {
				console.log("got result", responsesLeft, result);
				expect(result.error).toBeFalsy();
				expect(Array.isArray(result.data?.drivers)).toBe(true);
				expect(Array.isArray(result.data?.drivers[0].cars)).toBe(true);
				if (--responsesLeft < 1) {
					done();
				}
			}
		);
	});
})