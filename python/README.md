# Company to LinkedIn API — Python examples

Find LinkedIn company pages from websites, or websites from LinkedIn company
pages, using Requests or async HTTPX. Each standalone file shows all the HTTP
calls in one place.

## Setup

Use Python 3.12 or newer. From this `python` folder:

```sh
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
export DATABLIST_API_KEY='your-personal-api-key'
```

Create your key on the [Datablist API page](https://app.datablist.com/account/api).
Calls use credits; see the current
[credit cost and limits](https://platform.datablist.com/docs/enrichments/tools/company-to-linkedin#credits-and-limits)
and [pricing](https://www.datablist.com/pricing).

## Run an example

**Synchronous, using Requests:**

```sh
python sync_requests.py
```

**Asynchronous, using HTTPX:**

```sh
python async_httpx.py
```

Each file has three examples at the bottom:

1. Company domains or websites to LinkedIn company pages.
2. LinkedIn company pages to company websites.
3. A mixed list using both input types.

The first example is active. To try another, comment out the active
`matching_direction` and `source_urls` block, then uncomment the one you want.
Edit its sample URLs. Each run submits only the selected example.

Both scripts submit a background task, poll every three seconds, and read all
result pages. Requests uses blocking calls. HTTPX uses `await` and `asyncio.sleep`.

## Customize the example

For example, to find websites from LinkedIn company pages:

```python
matching_direction = "linkedin_to_domain"
source_urls = [
    "https://www.linkedin.com/company/datablist/",
    "https://www.linkedin.com/company/microsoft/",
]
```

For a mixed list:

```python
matching_direction = "both"
source_urls = ["datablist.com", "https://www.linkedin.com/company/microsoft/"]
```

The function puts the direction in `settings.matchingDirection`, and each URL
in `data.sourceUrl`. See the root README for
[complete JSON requests](../README.md#input-and-output) for all three modes.
Use company page URLs rather than personal profile URLs.

## Results and limits

Each script prints full results, including `inputId`, `status`, `outputs`,
`creditsUsed`, and `error`. Match results to your input URLs through `inputId`.

See the [complete output example](../README.md#input-and-output) for all four
production output fields: `companyName`, `companyWebsite`, `companyLinkedInUrl`,
and `confidence`. The schema enables `confidence` for website-to-LinkedIn and
mixed lookups.

Each run submits one task of up to 10,000 inputs, within the API's request-size
limits. These examples do not batch larger lists.

## When something fails

HTTP errors raise the library's normal exception. A failed or stopped task
raises an exception with its task ID. A completed task can still have individual
errors or no match; check each result's `status` and `error`.

If you stop a script, the task continues on the server. List your
[tasks](https://platform.datablist.com/docs/enrichments/tasks) to check its status
before creating another task.
