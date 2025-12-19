/**
 * server.js
 * Run: node server.js
 */
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Shopify CDN JSON URL
const CDN_JSON_URL =
  "https://cdn.shopify.com/s/files/1/0788/4629/6371/files/apikey.json";

// Shop Minis Admin API
const SHOP_MINIS_GRAPHQL =
  "https://server.shop.app/minis/admin-api/alpha/graphql.json";

// 👉 Set this in env
// export SHOP_MINIS_ADMIN_API_KEY="your-admin-api-key"

app.get("/api/apikey", async (req, res) => {
  try {
    /* ===============================
    1️⃣ Read token from header
    =============================== */
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Missing Authorization token" });
    }

    /* ===============================
    2️⃣ Verify token with Shopify
    =============================== */
    const query = `
      mutation VerifyUserToken($token: String!) {
        userTokenVerify(token: $token) {
          publicId
          tokenExpiresAt
          userErrors {
            code
            message
          }
        }
      }
    `;

    const verifyRes = await fetch(SHOP_MINIS_GRAPHQL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SHOP_MINIS_ADMIN_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        variables: { token },
      }),
    });

    const verifyJson = await verifyRes.json();
    const verifyData = verifyJson?.data?.userTokenVerify;

    if (!verifyData || verifyData.userErrors.length > 0) {
      return res.status(401).json({
        error: "Invalid token",
        details: verifyData?.userErrors,
      });
    }

    /* ===============================
    3️⃣ Token valid → fetch CDN JSON
    =============================== */
    const cdnRes = await fetch(CDN_JSON_URL);
    if (!cdnRes.ok) {
      return res.status(500).json({
        error: "Failed to fetch JSON from Shopify CDN",
      });
    }

    const cdnJson = await cdnRes.json();

    /* ===============================
    4️⃣ Send response
    =============================== */
    return res.json({
      success: true,
      userId: verifyData.publicId,
      data: cdnJson,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at ${PORT}`);
});
