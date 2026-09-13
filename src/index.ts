// NOTE: log4js appenders must be written in CommonJS

import * as Sentry from "@sentry/node";

// @ts-ignore: missing type definitions
import { dummyLayout } from "log4js/lib/layouts";

import type {
	NodeOptions,
	SeverityLevel,
	User,
} from "@sentry/node";
import type {
	AppenderFunction,
	LayoutFunction,
	LayoutsParam,
	Levels,
	Log4js,
	LoggingEvent,
} from "log4js";

export interface Config extends Partial<NodeOptions> {
	/**
	 * The Data Source Name (DSN) for connecting to the Sentry server.
	 *
	 * @see https://<project_name>.sentry.io/settings/projects/node/keys/
	 * @see https://docs.sentry.io/product/sentry-basics/dsn-explainer/#the-parts-of-the-dsn
	 */
	dsn: string;
	/**
	 * Sentry user data for scope setting
	 */
	user?: User;
	/**
	 * Levels to be reported to Sentry.
	 */
	levels?: SentryAppenderLevels[];
}

declare module "log4js" {
	interface Appenders {
		SentryAppender: {
			type: "log4js-appender-sentry";
		} & Config;
	}
}

export type SentryAppenderLevels = keyof Pick<
	Levels,
	| "WARN"
	| "ERROR"
	| "FATAL"
>;

/**
 * Map log4js string log levels to their corresponding Sentry levels.
 */
const levelMap = {
	WARN: "warning",
	ERROR: "error",
	FATAL: "fatal",
} satisfies Record<SentryAppenderLevels, SeverityLevel | undefined>;

export function sentry(
	config: Config,
	levels: Levels,
	layout: LayoutFunction,
): AppenderFunction {
	Sentry.init(config);

	function appender(loggingEvent: LoggingEvent) {
		const eventLevel = levels.getLevel(loggingEvent.level.levelStr);
		/**
		 * Sentry is mainly used to report application errors.
		 */
		if (eventLevel.isGreaterThanOrEqualTo(levels.WARN) === false) {
			return;
		}

		Sentry.withScope((scope) => {
			const level = eventLevel.levelStr as SentryAppenderLevels;

			scope.setLevel(levelMap[level]);
			scope.setExtra("category", loggingEvent.categoryName);

			if (config.user) {
				scope.setUser(config.user);
			}

			const msg = layout(loggingEvent);
			const eventId = Sentry.captureMessage(msg);
			// const eventId = Sentry.captureException(msg);
		});
	}

	// log4js waits until every appender calls the shutdown callback.
	appender.shutdown = ((done) => {
		Sentry.close().then(() => done?.(), done);
	}) satisfies Log4js["shutdown"];

	return appender;
}

export class ConfigError extends Error {
	constructor(msg: string, cause?: unknown) {
		super(msg);
		this.name = this.constructor.name;
		this.cause = cause;
	}
}

export function configure(
	config: Config,
	layouts: LayoutsParam,
	_findAppender: () => AppenderFunction,
	levels: Levels,
): AppenderFunction {
	const layout = layouts?.basicLayout ?? dummyLayout;

	return sentry(config, levels, layout);
}
