# API Documentation

## Endpoints

### GET /api/contents

Returns a list of all published resources in the application, formatted similar to GitHub's repository contents API.

**Response Format:**

```json
[
  {
    "name": "Resource Name",
    "path": "resource-type/resource-id",
    "type": "race|category|event",
    "size": 1234,
    "sha": "resource-id",
    "url": "/api/contents/resource-type/resource-id",
    "html_url": "/resource-type/resource-id",
    "git_url": null,
    "download_url": "url-to-resource-image-if-available"
  }
]
```

**Resource Types:**

- `race`: Published races (corridas)
- `category`: Active categories (categorias)
- `event`: Published events (eventos)

**Example Request:**

```bash
curl https://your-domain.vercel.app/api/contents
```

**Example Response:**

```json
[
  {
    "name": "Maratona de São Paulo 2024",
    "path": "corridas/abc123",
    "type": "race",
    "size": 256,
    "sha": "abc123",
    "url": "your-domain.vercel.app/api/contents/corridas/abc123",
    "html_url": "https://your-domain.vercel.app/corridas/abc123",
    "git_url": null,
    "download_url": "https://example.com/race-image.jpg"
  },
  {
    "name": "Corrida de Rua",
    "path": "categorias/def456",
    "type": "category",
    "size": 128,
    "sha": "def456",
    "url": "your-domain.vercel.app/api/contents/categorias/def456",
    "html_url": "https://your-domain.vercel.app/categorias/def456",
    "git_url": null,
    "download_url": null
  }
]
```

## Implementation

This API endpoint is implemented as a Vercel serverless function and queries data from Supabase. It:

1. Fetches all published races (`corridas` table)
2. Fetches all active categories (`categorias` table)
3. Fetches all published events (`eventos` table)
4. Formats the response similar to GitHub's API structure
5. Returns a JSON array of all resources

## CORS

The API includes CORS headers to allow cross-origin requests from any domain.
