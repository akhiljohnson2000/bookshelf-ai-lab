---
name: test
description: Test BookShelf API endpoints end-to-end against a running server. Use when asked to test an endpoint, verify an API change, check status codes / response shapes, or smoke-test the API after edits.
---

# Test the BookShelf API

You are exercising the real HTTP API as a client — booting the server and hitting
endpoints with `curl`, not unit-testing internals. Verify status codes, the response
envelope, and any data-layer side effects.

## When to use
- After adding or changing a route, service, repository, or validation middleware.
- When asked to "test the API", "verify the endpoint", or "check it returns 404 / the right shape".

## Critical constraint — never mutate real data
Mutating endpoints (`POST`, `PUT`, `DELETE`) write to `/data/*.json`. ALWAYS run the
server against a throwaway copy so the real catalogue is untouched:

```bash
TMP=$(mktemp -d)/data && mkdir -p "$TMP" && cp data/*.json "$TMP"/
npm run build --workspace=@bookshelf/shared >/dev/null 2>&1
PORT=4222 DATA_DIR="$TMP" npx tsx apps/api/src/server.ts > /tmp/api_test.log 2>&1 &
# wait for readiness:
for i in $(seq 1 25); do curl -s http://localhost:4222/health | grep -q ok && break; sleep 0.4; done
```

Use a non-default port (e.g. `4222`) to avoid clashing with a running dev server.

## Steps
1. Typecheck first: `npx tsc -p apps/api/tsconfig.json --noEmit`.
2. Start the server on a throwaway `DATA_DIR` copy (snippet above).
3. Hit each endpoint with `curl -s -o /tmp/r.json -w "HTTP %{http_code}\n"` and print the body.
4. Cover, for the endpoint under test:
   - the happy path (correct status + body),
   - each validation / not-found / conflict branch (`400` / `404` / `409`),
   - any data-layer side effect (e.g. a `DELETE` cascade — assert the other JSON file changed).
5. Stop the server (`lsof -ti tcp:4222 | xargs kill`) and `rm -rf` the temp dir.
6. Confirm real data is untouched: `git status --short data/` (expect no output).

## Assert on
- **Status code** matches the convention (`201` on create, `404` missing, `400` validation, `409` duplicate).
- **Envelope** matches `@bookshelf/shared`: success → `{ success: true, data }` (lists add `meta`);
  error → `{ success: false, error: { message, code, details? } }`.
- **Side effects** in the data files for mutations, verified by reading the throwaway copy.

## Constraints
- Don't run mutating tests against the real `/data` — always the throwaway copy.
- Don't add a test-runner dependency to satisfy a request — this skill is HTTP smoke-testing.
  (When a real suite is added it's Vitest/Jest with mocked data access, per CLAUDE.md.)
- Don't leave servers running or temp dirs behind — always clean up.

## Example output

```
### POST /api/books — valid          
-> HTTP 201  { "success": true, "data": { "id": "book_052", ... } }
### POST /api/books — missing title  
-> HTTP 400  { "success": false, "error": { "code": "VALIDATION_ERROR",
                                                     "details": { "title": "title is required" } } }
### DELETE /api/books/book_002        
-> HTTP 200  { "success": true, "data": { "id": "book_002", "removedFromShelves": 1 } }
### DELETE /api/books/book_002 again  
-> HTTP 404  { "success": false, "error": { "code": "NOT_FOUND" } }
shelf_001 bookIds: ["book_002","book_007"] 
-> ["book_007"]   ✅ cascade
git status --short data/  
-> (clean)                          ✅ real data untouched
```

## Optional user instructions
$ARGUMENTS
