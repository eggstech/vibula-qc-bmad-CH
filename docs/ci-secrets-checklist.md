# CI Secrets Checklist

Please ensure the following secrets/variables are configured in your GitHub Repository settings (**Settings > Secrets and variables > Actions**).

## Required Secrets

-   `BASE_URL`: The URL of the frontend application being tested.
-   `API_URL`: The URL of the backend API.

## Recommended Settings

-   **Parallelism**: The pipeline is configured for 4 shards. Ensure your GitHub runner quota allows for this.
-   **Permissions**: Ensure the `GITHUB_TOKEN` has `contents: read` and `actions: write` scope (usually default).
