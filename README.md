# Sentry log4js appender

Sends logging events to Sentry. This appender integrates
[@sentry/node][sentry_javascript].

## Installation

**npm registry**

```sh
npm install log4js-appender-sentry
```

## Options

The [`SentryAppender`][internal_types] interface extends the `NodeClientOptions`
interface and provides additional options specific to the Node Sentry appender
SDK.

Sentry is mainly used to report application errors so the default log level is
`WARN` and above, other log levels will be ignored.

**`type`**

The type of the appender, must be set to `log4js-appender-sentry`.

**`dsn`**

A DSN tells a Sentry SDK where to send events so the events are associated with
the correct project. See [documentation][sentry_dsn].

**`user`**

User data for scope configuration. See [documentation][sentry_user].

## Configuration

**TypeScript**

If you're using TypeScript, importing this library as a side effect will
automatically merge the log4js interface `Appenders`. This merging enables
autocomplete for the appenders configuration, providing convenient access to its
properties.

```ts
import "log4js-appender-sentry"
```

**example**

```json {3-6, 12}
{
    "appenders": {
        "sentry": {
            "type": "log4js-appender-sentry",
            "dsn": "..."
        }
    },
    "categories": {
        "default": {
            "level": "debug",
            "appenders": [
                "sentry"
            ]
        }
    }
}
```

[internal_types]: ./index.d.ts
[sentry_javascript]: https://github.com/getsentry/sentry-javascript
[sentry_user]: https://docs.sentry.io/platforms/javascript/enriching-events/identify-user/
[sentry_dsn]: https://docs.sentry.io/product/sentry-basics/dsn-explainer/
