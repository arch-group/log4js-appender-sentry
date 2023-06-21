// @ts-check
const Sentry = require("@sentry/node");

/**
 * @typedef {import(".").SentryAppender} SentryAppender
 * @typedef {import("@sentry/node").SeverityLevel} SentryLevel
 * @typedef {import('@sentry/node').Event} SentryEvent
 * @typedef {import('log4js').Levels} Levels
 * @typedef {import('log4js').LoggingEvent} LoggingEvent
 */

/**
 * @param {SentryAppender} config
 * @param {Levels} levels
 *
 * @returns {(loggingEvent: LoggingEvent) => void}
 */
function sentry(config, levels) {
    Sentry.init(config);
    /**
     * @param {LoggingEvent} logEvent
     */
    const appender = (logEvent) => {
        const eventLevel = levels.getLevel(logEvent.level.levelStr);
        /**
         * Sentry is mainly used to report application errors.
         */
        if (eventLevel.isGreaterThanOrEqualTo(levels.WARN) === false) {
            return;
        }

        /**
         * Map log4js string log levels to their corresponding Sentry levels.
         *
         * @typedef {SentryLevel} SeverityLevel
         * @typedef {import(".").SentryAppenderLevels} Log4jsLevels
         *
         * @type {Record<Log4jsLevels, SeverityLevel | undefined>}
         */
        const levelMapping = {
            WARN: "warning",
            ERROR: "error",
            FATAL: "fatal",
        };

        Sentry.withScope((scope) => {
            scope.setLevel(levelMapping[eventLevel.levelStr]);
            scope.setExtra("category", logEvent.categoryName);
            if (config.user) {
                scope.setUser(config.user);
            }

            const [msg] = logEvent.data;
            if (typeof msg === "string") {
                Sentry.captureMessage(msg);
            } else if (msg instanceof Object) {
                // TODO:
            } else if (msg instanceof Error) {
                Sentry.captureException(msg);
            }
        });
    };

    /** 
     * TODO:
     * @link https://log4js-node.github.io/log4js-node/writing-appenders.html#example-shutdown
     */
    // app.shutdown = () => {}

    return appender;
}

class ConfigError extends Error {
    name = "ConfigError";
    constructor(cause, msg) {
        super(msg);
        this.cause = cause;
    }
}

/**
 * @typedef {import('log4js').LayoutsParam} LayoutsParam
 * @typedef {import('log4js').AppenderFunction} AppenderFunction
 */

/**
 * @param {SentryAppender} config
 * @param {LayoutsParam} _layouts
 * @param {() => AppenderFunction} _findAppender
 * @param {Levels} levels
 *
 * @returns {AppenderFunction}
 */
function configure(config, _layouts, _findAppender, levels) {
    if (!config.dsn) {
        throw new ConfigError("Missing DNS property in Sentry appender config.");
    }

    return sentry(config, levels);
}

exports.configure = configure;
