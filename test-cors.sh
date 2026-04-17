#!/bin/bash

# Mental Wellness API - Simple CORS & Endpoint Testing Script

API_URL="http://localhost:5001"
FRONTEND_ORIGIN="http://localhost:3000"

echo "════════════════════════════════════════════════"
echo "  Mental Wellness App - CORS & API Tests"
echo "════════════════════════════════════════════════"
echo ""

# Test 1: Basic Health
echo "Test 1: Basic Health Endpoint"
echo "  GET /api/health"
curl -s -H "Origin: ${FRONTEND_ORIGIN}" "${API_URL}/api/health" | jq .
echo ""

# Test 2: AI Health
echo "Test 2: AI System Health"
echo "  GET /api/ai/health"
curl -s -H "Origin: ${FRONTEND_ORIGIN}" "${API_URL}/api/ai/health" | jq .
echo ""

# Test 3: Check CORS Headers on Preflight
echo "Test 3: CORS Preflight (OPTIONS request)"
echo "  OPTIONS /api/ai/health"
curl -i -X OPTIONS \
  -H "Origin: ${FRONTEND_ORIGIN}" \
  -H "Access-Control-Request-Method: POST" \
  "${API_URL}/api/ai/health" 2>&1 | grep -E "HTTP|Access-Control|200|204"
echo ""

# Test 4: Check CORS Headers on Regular Request
echo "Test 4: CORS Headers on Regular Request"
echo "  GET /api/health (with CORS Origin header)"
curl -i -H "Origin: ${FRONTEND_ORIGIN}" "${API_URL}/api/health" 2>&1 | head -20
echo ""

# Test 5: Cross-Origin POST
echo "Test 5: Cross-Origin POST (User Registration)"
echo "  POST /api/auth/register"
curl -s -X POST \
  -H "Origin: ${FRONTEND_ORIGIN}" \
  -H "Content-Type: application/json" \
  -d '{"name":"TestUser","email":"test@example.com","password":"Test@123"}' \
  "${API_URL}/api/auth/register" | jq .
echo ""

echo "════════════════════════════════════════════════"
echo "✓ API Testing Complete"
echo "════════════════════════════════════════════════"
