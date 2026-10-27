# Company to LinkedIn API

Find LinkedIn company pages from company domains and websites with the
[Datablist](https://www.datablist.com/) Company to LinkedIn API.

Add missing LinkedIn URLs to your prospect lists and CRM accounts, then use them
for company research and sales outreach. You can also start with LinkedIn company
pages and find the websites you need for email finding or further enrichment.

[View the API schema](https://api.datablist.com/v1/enrichments/company-to-linkedin).

## Cost

- **1.5 credits per successful lookup** for regular website/LinkedIn matching.
- **10 credits per lookup** for numeric-ID or Sales Navigator company URLs
  used to find a website.

Costs are in Datablist credits. Each result reports its actual `creditsUsed`.
See the [API cost and limits](https://platform.datablist.com/docs/enrichments/tools/company-to-linkedin#credits-and-limits)
and [credit pack pricing](https://www.datablist.com/pricing) for current rates.

## Get started

Choose [Python](python/README.md) or [TypeScript](typescript/README.md).
Create a [Personal API Key](https://app.datablist.com/account/api), then run an
example from the repository root.

**Python:**

```sh
cd python
python -m pip install -r requirements.txt
export DATABLIST_API_KEY='your-personal-api-key'
python sync_requests.py
```

**TypeScript:**

```sh
export DATABLIST_API_KEY='your-personal-api-key'
npx tsx typescript/example.ts
```

With Node.js 24.3 or newer, you can also run `node typescript/example.ts` directly.
Run each command block from the repository root.

## Input and output

Send requests to `POST https://api.datablist.com/v1/enrichments/tasks`, with your
key in the `X-API-Key` header. Put each domain, website, or LinkedIn company URL
in `data.sourceUrl`.

### Company domains or websites to LinkedIn company pages

Set `matchingDirection` to `"domain_to_linkedin"`. This request shows both a bare
domain and a full website URL:

```json
{
  "enrichmentId": "company-to-linkedin",
  "uniqueId": "company-to-linkedin-domain-001",
  "settings": {
    "matchingDirection": "domain_to_linkedin"
  },
  "inputs": [
    {
      "inputId": "row-1",
      "data": {
        "sourceUrl": "datablist.com"
      }
    },
    {
      "inputId": "row-2",
      "data": {
        "sourceUrl": "https://www.microsoft.com"
      }
    }
  ]
}
```

Use a new `uniqueId` for each new task. Give each company its own `inputId` to
match it to its result, including when URLs repeat.

The API returns `202 Accepted` with a task ID in `@id`. Check the task status,
then retrieve the results. This response shows **all four production output
fields** (sample data):

```json
{
  "taskId": "00000000000040008000000000000001",
  "results": [
    {
      "inputId": "row-1",
      "status": "success",
      "outputs": {
        "companyName": "Datablist",
        "companyWebsite": "https://www.datablist.com",
        "companyLinkedInUrl": "https://www.linkedin.com/company/datablist/",
        "confidence": "high"
      },
      "creditsUsed": "1.5",
      "error": null
    },
    {
      "inputId": "row-2",
      "status": "success",
      "outputs": {
        "companyName": "Microsoft",
        "companyWebsite": "https://www.microsoft.com",
        "companyLinkedInUrl": "https://www.linkedin.com/company/microsoft/",
        "confidence": "high"
      },
      "creditsUsed": "1.5",
      "error": null
    }
  ],
  "nextCursor": null
}
```

| Output | Meaning |
| --- | --- |
| `companyName` | The company name, when found. |
| `companyWebsite` | The matched company website. |
| `companyLinkedInUrl` | The standard LinkedIn company page URL. |
| `confidence` | `high` when the website match was validated, or `low` otherwise. The schema enables this field for `domain_to_linkedin` and `both`. |

Available fields depend on the result. The scripts print complete result objects,
including statuses, credits, and errors. Use the returned `companyLinkedInUrl`
with our [LinkedIn Company Scraper API](https://github.com/datablist/linkedin-company-scraper-api)
to retrieve company descriptions, industries, employee counts, and more.

### LinkedIn company pages to company websites

Set `matchingDirection` to `"linkedin_to_domain"` and use the same `sourceUrl`
field for LinkedIn company URLs:

```json
{
  "enrichmentId": "company-to-linkedin",
  "uniqueId": "company-to-linkedin-website-001",
  "settings": {
    "matchingDirection": "linkedin_to_domain"
  },
  "inputs": [
    {
      "inputId": "row-1",
      "data": {
        "sourceUrl": "https://www.linkedin.com/company/datablist/"
      }
    },
    {
      "inputId": "row-2",
      "data": {
        "sourceUrl": "https://www.linkedin.com/company/microsoft/"
      }
    }
  ]
}
```

Standard LinkedIn company URLs, numeric company URLs, and Sales Navigator company
URLs are supported. Numeric-ID and Sales Navigator lookups can have different
credit costs; see the
[API pricing details](https://platform.datablist.com/docs/enrichments/tools/company-to-linkedin#credits-and-limits).
Use company pages rather than personal profile URLs.

### A mixed list of websites and LinkedIn company pages

Set `matchingDirection` to `"both"` when your list contains both input types:

```json
{
  "enrichmentId": "company-to-linkedin",
  "uniqueId": "company-to-linkedin-mixed-001",
  "settings": {
    "matchingDirection": "both"
  },
  "inputs": [
    {
      "inputId": "row-1",
      "data": {
        "sourceUrl": "datablist.com"
      }
    },
    {
      "inputId": "row-2",
      "data": {
        "sourceUrl": "https://www.linkedin.com/company/microsoft/"
      }
    }
  ]
}
```

The API detects the lookup direction from each `sourceUrl`. All three scripts
include an editable example for each mode at the bottom. Select one before
running; each run submits only that example.

## Try with cURL

Set your key, then submit a company domain:

```sh
export DATABLIST_API_KEY='your-personal-api-key'

curl --request POST 'https://api.datablist.com/v1/enrichments/tasks' \
  --header "X-API-Key: $DATABLIST_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{
    "enrichmentId": "company-to-linkedin",
    "uniqueId": "company-to-linkedin-curl-001",
    "settings": {"matchingDirection": "domain_to_linkedin"},
    "inputs": [
      {"inputId": "row-1", "data": {"sourceUrl": "datablist.com"}}
    ]
  }'
```

Copy the returned `@id` into `TASK_ID`. Use a new `uniqueId` for a new task.

```sh
TASK_ID='paste-returned-task-id'

curl "https://api.datablist.com/v1/enrichments/tasks/$TASK_ID" \
  --header "X-API-Key: $DATABLIST_API_KEY"
```

Repeat the status command every few seconds until `status` is `completed`,
`failed`, or `stopped`. Then retrieve the results:

```sh
curl "https://api.datablist.com/v1/enrichments/tasks/$TASK_ID/results" \
  --header "X-API-Key: $DATABLIST_API_KEY"
```

If `nextCursor` is not `null`, pass it as `cursor` to fetch the next page.
The Python and TypeScript examples read every page for you.

## Code examples

| Example | What it shows |
| --- | --- |
| [Synchronous Requests](python/sync_requests.py) | Match company websites and LinkedIn pages with blocking HTTP calls. |
| [Asynchronous HTTPX](python/async_httpx.py) | Use `async` and `await` for the same API workflow. |
| [TypeScript](typescript/example.ts) | Use async/await, built-in `fetch`, and no imports. |

Each script is self-contained: submit the inputs, wait for the background task,
and read every result page. Both Python clients use asynchronous backend tasks;
Requests blocks while HTTPX uses `await`.

Each run submits one task of up to 10,000 inputs, within the API's request-size
limits. These examples do not batch larger lists.

## Documentation

- [Company to LinkedIn API](https://platform.datablist.com/docs/enrichments/tools/company-to-linkedin)
- [Enrichments API quickstart](https://platform.datablist.com/docs/enrichments/quickstart)
- [Task lifecycle](https://platform.datablist.com/docs/enrichments/tasks)

## Other Datablist API examples

- [Company Name to Domain API](https://github.com/datablist/company-name-to-domain-api): find company websites from names.
- [Company Name Cleaner API](https://github.com/datablist/company-name-cleaner-api): clean and standardize company names.
- [LinkedIn Profile Finder API](https://github.com/datablist/linkedin-profile-finder-api): find profiles from names and company keywords.
- [LinkedIn Profile Scraper API](https://github.com/datablist/linkedin-profile-scraper-api): retrieve profile, employment, and education details from LinkedIn URLs.
- [LinkedIn Company Scraper API](https://github.com/datablist/linkedin-company-scraper-api): retrieve company details from LinkedIn company pages.
- [Impressum Scraper API](https://github.com/datablist/impressum-scraper-api): extract business details from website Impressum pages.
- [Waterfall Email Finder API](https://github.com/datablist/waterfall-email-finder-api): find work emails from names and companies or LinkedIn URLs.
