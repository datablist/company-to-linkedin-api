# Company to LinkedIn API — TypeScript example

Match company websites and LinkedIn company pages with async/await and built-in
`fetch`. All HTTP calls are in [one standalone file](example.ts).

## Setup and run

From the repository root:

```sh
export DATABLIST_API_KEY='your-personal-api-key'
npx tsx typescript/example.ts
```

With Node.js 24.3 or newer, no runner package is needed:

```sh
node typescript/example.ts
```

From this `typescript` folder, use `npx tsx example.ts` or `node example.ts`.
Create your key on the [Datablist API page](https://app.datablist.com/account/api).
Calls use credits; see the current
[credit cost and limits](https://platform.datablist.com/docs/enrichments/tools/company-to-linkedin#credits-and-limits)
and [pricing](https://www.datablist.com/pricing).

## Choose an example

The file has three examples at the bottom:

1. Company domains or websites to LinkedIn company pages.
2. LinkedIn company pages to company websites.
3. A mixed list using both input types.

The first example is active. To try another, comment out the active
`matchingDirection` and `sourceUrls` block, then uncomment the one you want.
Edit its sample URLs. Each run submits only the selected example.

For example, to find websites from LinkedIn company pages:

```typescript
const matchingDirection = "linkedin_to_domain";
const sourceUrls = [
  "https://www.linkedin.com/company/datablist/",
  "https://www.linkedin.com/company/microsoft/",
];
```

For a mixed list:

```typescript
const matchingDirection = "both";
const sourceUrls = ["datablist.com", "https://www.linkedin.com/company/microsoft/"];
```

The function puts the direction in `settings.matchingDirection`, and each URL
in `data.sourceUrl`. See the root README for
[complete JSON requests](../README.md#input-and-output) for all three modes.
Use company page URLs rather than personal profile URLs.

## How it works

The script submits one task, polls every three seconds, and reads result pages
until `nextCursor` is `null`. It uses `fetch`, `crypto.randomUUID()`, and
`setTimeout`, with no imports. The example reads your key from the environment.

Each URL gets its own `inputId`, including repeated URLs. Full results are printed
as JSON, including statuses, outputs, credits used, and errors. See the
[complete output example](../README.md#input-and-output) for all four production
output fields: `companyName`, `companyWebsite`, `companyLinkedInUrl`, and
`confidence`. The schema enables `confidence` for website-to-LinkedIn and mixed
lookups.

Each run submits one task of up to 10,000 inputs, within the API's request-size
limits. This example does not batch larger lists.

## When something fails

HTTP errors and network failures stop the script. A failed or stopped task
throws an error with its task ID. A completed task can still have individual
errors or no match; check each result's `status` and `error`.

If you stop the script, the task continues on the server. List your
[tasks](https://platform.datablist.com/docs/enrichments/tasks) to check its status
before creating another task.
