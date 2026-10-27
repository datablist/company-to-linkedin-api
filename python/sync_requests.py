"""Match company websites and LinkedIn company pages using the Datablist API and Requests.

This standalone example submits a small list of company domains, websites, or
LinkedIn company URLs, waits for the task, and reads all result pages.
HTTP calls and three-second polling pauses block until they finish.

Choose one example at the bottom: domains/websites to LinkedIn, LinkedIn to
websites, or a mixed list. Each example sets matching_direction and source_urls.
Only the selected example runs. Complete results are printed, including
company names, websites, LinkedIn URLs, confidence, credits, and errors.

Set DATABLIST_API_KEY and run: python sync_requests.py
Edit the selected list to use your own companies. This example submits one task
of up to 10,000 inputs. Calls use account credits.
"""

import os
import time
import uuid

import requests


def match_companies(
    source_urls: list[str], api_key: str, matching_direction: str
) -> list[dict]:
    """Submit one task, wait for it to finish, and return its results."""
    tasks_url = "https://api.datablist.com/v1/enrichments/tasks"
    headers = {"X-API-Key": api_key}
    inputs = [
        {"inputId": f"row-{index}", "data": {"sourceUrl": source_url}}
        for index, source_url in enumerate(source_urls, start=1)
    ]

    # 1. Submit the company websites or LinkedIn URLs.
    payload = {
        "enrichmentId": "company-to-linkedin",
        "uniqueId": str(uuid.uuid4()),
        "settings": {"matchingDirection": matching_direction},
        "inputs": inputs,
    }
    response = requests.post(tasks_url, headers=headers, json=payload)
    response.raise_for_status()
    task = response.json()
    task_id = task["@id"]
    task_url = f"{tasks_url}/{task_id}"

    # 2. Wait for the background task to finish.
    while task["status"] not in ("completed", "failed", "stopped"):
        time.sleep(3)
        response = requests.get(task_url, headers=headers)
        response.raise_for_status()
        task = response.json()

    if task["status"] != "completed":
        raise RuntimeError(f"Task {task_id} {task['status']}: {task.get('error')}")

    # 3. Read the results, following pagination when needed.
    results = []
    results_url = f"{task_url}/results"
    params = {"limit": 100}
    while True:
        response = requests.get(results_url, headers=headers, params=params)
        response.raise_for_status()
        page = response.json()
        results.extend(page["results"])
        next_cursor = page["nextCursor"]
        if next_cursor is None:
            break
        params["cursor"] = next_cursor

    return results


if __name__ == "__main__":
    api_key = os.environ["DATABLIST_API_KEY"]
    # Choose one example below. Leave the other examples commented out.

    # 1. Company domains or websites to LinkedIn company pages.
    matching_direction = "domain_to_linkedin"
    source_urls = ["datablist.com", "https://www.microsoft.com"]

    # 2. LinkedIn company pages to company websites.
    # matching_direction = "linkedin_to_domain"
    # source_urls = [
    #     "https://www.linkedin.com/company/datablist/",
    #     "https://www.linkedin.com/company/microsoft/",
    # ]

    # 3. A mixed list of websites and LinkedIn company pages.
    # matching_direction = "both"
    # source_urls = ["datablist.com", "https://www.linkedin.com/company/microsoft/"]

    results = match_companies(source_urls, api_key, matching_direction)
    for result in results:
        print(result)
