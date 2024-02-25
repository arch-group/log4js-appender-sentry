import assert from "node:assert";
import { describe, test } from "node:test";

import { dummyLayout } from "log4js/lib/layouts";
import Level from "log4js/lib/levels";

import type { LoggingEvent } from "log4js";

import { sentry } from "./dist";

function makeLogEvent(): LoggingEvent {
	return {
		categoryName: "default",
		startTime: new Date(),
		data: ["test"],
		pid: 0,
		fileName: "",
		lineNumber: 0,
		columnNumber: 0,
		callStack: "",
		functionName: "",
		context: null,
		serialise: () => "",
		level: new Level(40000, "ERROR", "red"),
	};
}

/**
 * TODO: fetch events from sentry to validate integration
 * TODO: validate if dsn is valid
 * TODO: shutdown test
 */
describe("Sentry integration", () => {
	const appender = sentry(
		{
			dsn: "<your_token>",
		},
		Level,
		dummyLayout,
	);

	test("append log", async () => {
		const logEvent = makeLogEvent();

		assert.doesNotThrow(() => {
			appender(logEvent);
		});
	});

	test("shutdown", () => {
		assert.doesNotThrow(() => {
			// @ts-ignore
			appender.shutdown();
		});
	});
});
