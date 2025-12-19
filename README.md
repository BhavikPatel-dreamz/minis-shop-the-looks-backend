# Shopify API Backend

A Node.js Express backend that integrates with Shopify's API to verify user tokens and fetch data from Shopify CDN.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env` file and update `SHOP_MINIS_ADMIN_API_KEY` with your actual API key

3. Start the server:
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

## API Endpoints

### GET /api/apikey

Verifies a user token and returns data from Shopify CDN.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "userId": "user-public-id",
  "data": { /* CDN JSON data */ }
}
```

**Error Responses:**
- `401`: Missing or invalid authorization token
- `500`: Server error or CDN fetch failure

## Environment Variables

- `PORT`: Server port (default: 3000)
- `SHOP_MINIS_ADMIN_API_KEY`: Your Shop Minis Admin API key

## Usage

The server runs on `http://localhost:3000` by default. Make requests to `/api/apikey` with a valid Bearer token in the Authorization header.