/**
 * Match company websites and LinkedIn company pages with async/await and fetch.
 *
 * Submit company domains, websites, or LinkedIn URLs, wait for the background
 * task, and read every result page. Poll every three seconds.
 *
 * Set DATABLIST_API_KEY, then run from the repository root:
 * npx tsx typescript/example.ts
 * Or with Node.js 24.3 or newer: node typescript/example.ts
 *
 * Choose one example at the bottom: websites to LinkedIn, LinkedIn to websites,
 * or a mixed list. Each example sets matchingDirection and sourceUrls.
 * Only the selected example runs. Full results are printed as JSON.
 * One task accepts up to 10,000 inputs. Calls use account credits.
 */

/** Submit one task, wait for it to finish, and return its results. */
async function matchCompanies(
  sourceUrls: string[],
  apiKey: string,
  matchingDirection: string,
): Promise<object[]> {
  const tasksUrl = "https://api.datablist.com/v1/enrichments/tasks";
  const headers = {
    "X-API-Key": apiKey,
    "Content-Type": "application/json",
  };
  const inputs = sourceUrls.map((sourceUrl, index) => {
    return {
      inputId: `row-${index + 1}`,
      data: { sourceUrl },
    };
  });

  // 1. Submit the inputs.
  const payload = {
    enrichmentId: "company-to-linkedin",
    uniqueId: crypto.randomUUID(),
    settings: { matchingDirection },
    inputs,
  };
  let response = await fetch(tasksUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  let task = await response.json();
  const taskId = task["@id"];
  const taskUrl = `${tasksUrl}/${taskId}`;

  // 2. Wait for the background task to finish.
  while (!["completed", "failed", "stopped"].includes(task.status)) {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 3000);
    });
    response = await fetch(taskUrl, { headers });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    task = await response.json();
  }

  if (task.status !== "completed") {
    throw new Error(`Task ${taskId} ${task.status}`);
  }

  // 3. Read every result page, until nextCursor is null.
  const results: object[] = [];
  const params = new URLSearchParams({ limit: "100" });
  while (true) {
    response = await fetch(`${taskUrl}/results?${params}`, { headers });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const page = await response.json();
    results.push(...page.results);
    if (page.nextCursor === null) {
      break;
    }
    params.set("cursor", page.nextCursor);
  }

  return results;
}

const apiKey = process.env.DATABLIST_API_KEY ?? "";
// Choose one example below. Leave the other examples commented out.

// 1. Company domains or websites to LinkedIn company pages.
const matchingDirection = "domain_to_linkedin";
const sourceUrls = ["datablist.com", "https://www.microsoft.com"];

// 2. LinkedIn company pages to company websites.
// const matchingDirection = "linkedin_to_domain";
// const sourceUrls = [
//   "https://www.linkedin.com/company/datablist/",
//   "https://www.linkedin.com/company/microsoft/",
// ];

// 3. A mixed list of websites and LinkedIn company pages.
// const matchingDirection = "both";
// const sourceUrls = ["datablist.com", "https://www.linkedin.com/company/microsoft/"];

const results = await matchCompanies(sourceUrls, apiKey, matchingDirection);
console.log(JSON.stringify(results, null, 2));
