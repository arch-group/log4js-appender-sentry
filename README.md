# log4js appender - Sentry

Sends logging events to Sentry. This appender integrates
[@sentry/node][sentry_javascript].

[sentry_javascript]: https://github.com/getsentry/sentry-javascript

## Installation

**npm registry**

```sh
npm install log4js-appender-sentry
```

## Configuration

### TypeScript

If you're using TypeScript, importing this library as a side effect will
automatically merge the log4js interface `Appenders`. This merging enables
autocomplete for the appenders configuration, providing convenient access to its
properties.

```ts
import "log4js-appender-sentry";
```

### Example

```ts
import log4js from "log4js";

import "log4js-appender-cloudwatch";

log4js.configure({
	appenders: {
		sentry: {
			type: "log4js-appender-sentry",
			dsn: "<config>",
			user: {
				// ...
			},
		},
	},
	categories: {
		default: {
			level: "debug",
			appenders: [
				"sentry",
			],
		},
	},
});

const log = log4js.getLogger();
// ...
```

## Options

Sentry is mainly used to report application errors so the default log level is
`WARN` and above, other log levels will be ignored.

### type

_Required_\
Type: log4js-appender-sentry

The type of the appender. Must be set to `log4js-appender-sentry`.

### dsn

_Required_\
Type: `string`

A DSN (Data Source Name) specifies where the Sentry SDK should send events,
ensuring they are associated with the correct project. Refer to the Sentry
[documentation][sentry_dsn] for more details on DSN.

[sentry_dsn]: https://docs.sentry.io/product/sentry-basics/dsn-explainer/

### user

_Optional_\
Type: `User`

```ts
// import { User } from "@sentry/node/types";

interface User {
	[key: string]: any;
	id?: string;
	ip_address?: string;
	email?: string;
	username?: string;
	segment?: string;
}
```

User data used for scope configuration. For additional information, see the
Sentry user [documentation][sentry_user].

[sentry_user]: https://docs.sentry.io/platforms/javascript/enriching-events/identify-user/
