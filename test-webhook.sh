#!/bin/bash

# Test script to check if webhook endpoint works with POST request
# This simulates what Stripe sends to your webhook

echo "Testing webhook endpoint with POST request..."

# Test with a simple POST request (should return "No signature" error)
curl -X POST https://contenov.com/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -v

echo ""
echo "Expected result: Should return HTTP 400 with 'No signature' error"
echo "If you get HTTP 405, there's a routing issue"
echo "If you get HTTP 400, the webhook is working correctly!"
