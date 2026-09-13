import {
	afterAll,
	beforeEach,
	describe,
	expect,
	test,
} from "bun:test";

import * as Sentry from "@sentry/node";
import type { ErrorEvent } from "@sentry/node";
import log4js from "log4js";
import { levels } from "log4js";
// @ts-ignore: missing type definitions
import { dummyLayout } from "log4js/lib/layouts";
// @ts-ignore: missing type definitions
import LoggingEvent from "log4js/lib/LoggingEvent.js";

import { sentry } from "./index.js";

function makeLogEvent(level: log4js.Level, data: unknown[] = ["test"]): log4js.LoggingEvent {
	return new LoggingEvent("default", level, data, {});
}

describe("Sentry appender", () => {
	const events: ErrorEvent[] = [];

	const appender = sentry(
		{
			// Syntactically valid DSN, events are dropped in `beforeSend` and never sent.
			dsn: "https://public@127.0.0.1/1",
			defaultIntegrations: false,
			user: { id: "42" },
			beforeSend: (event) => {
				events.push(event);
				return null;
			},
		},
		levels,
		dummyLayout,
	);

	beforeEach(() => {
		events.length = 0;
	});

	afterAll(() => {
		// @ts-ignore
		appender.shutdown();
	});

	test("reports WARN and above with mapped Sentry level", async () => {
		appender(makeLogEvent(levels.WARN, ["warn msg"]));
		appender(makeLogEvent(levels.ERROR, ["error msg"]));
		appender(makeLogEvent(levels.FATAL, ["fatal msg"]));
		await Sentry.flush(1000);

		expect(events.map((e) => [e.message, e.level])).toEqual([
			["warn msg", "warning"],
			["error msg", "error"],
			["fatal msg", "fatal"],
		]);
	});

	test("ignores levels below WARN", async () => {
		appender(makeLogEvent(levels.TRACE));
		appender(makeLogEvent(levels.DEBUG));
		appender(makeLogEvent(levels.INFO));
		await Sentry.flush(1000);

		expect(events).toHaveLength(0);
	});

	test("sets category and user on the scope", async () => {
		appender(makeLogEvent(levels.ERROR));
		await Sentry.flush(1000);

		expect(events).toHaveLength(1);
		expect(events[0].extra).toMatchObject({ category: "default" });
		expect(events[0].user).toMatchObject({ id: "42" });
	});
});

describe("log4js integration", () => {
	test("configure uses the log4js layout and shutdown completes", async () => {
		const events: ErrorEvent[] = [];

		log4js.configure({
			appenders: {
				sentry: {
					type: require.resolve("./index.ts"),
					dsn: "https://public@127.0.0.1/1",
					defaultIntegrations: false,
					beforeSend: (event: ErrorEvent) => {
						events.push(event);
						return null;
					},
				},
			},
			categories: {
				default: { appenders: ["sentry"], level: "debug" },
			},
		});

		const logger = log4js.getLogger("integration");
		logger.info("ignored");
		logger.error("boom");
		await Sentry.flush(1000);

		expect(events).toHaveLength(1);
		expect(events[0].level).toBe("error");
		expect(events[0].message).toContain("[ERROR] integration - boom");

		const error = await new Promise((resolve) => log4js.shutdown(resolve));
		expect(error).toBeUndefined();
	});
});
