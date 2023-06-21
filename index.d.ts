import { NodeClientOptions } from "@sentry/node/types/types";
import { User } from "@sentry/node/types";
import { Levels } from "log4js";

export type SentryAppenderLevels = keyof Pick<Levels,
    | "WARN"
    | "ERROR"
    | "FATAL"
>;

export interface SentryAppender extends NodeClientOptions {
    /**
     * The type of the appender, which is 'log4js-appender-sentry'.
     */
    type: "log4js-appender-sentry";
    /**
     * The Data Source Name (DSN) for connecting to the Sentry server.
     * It should follow the format: {PROTOCOL}://{PUBLIC_KEY}:{SECRET_KEY}@{HOST}{PATH}/{PROJECT_ID}
     *
     * @see https://docs.sentry.io/product/sentry-basics/dsn-explainer/#the-parts-of-the-dsn
     */
    dsn: string;
    /**
     * Sentry user data for scope setting
     */
    user?: User;
}

declare module "log4js" {
    interface Appenders {
        SentryAppender: SentryAppender;
    }
}
