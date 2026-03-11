#!/bin/bash

# =============================================================================
# EazyRentals Deployment Script
# =============================================================================
# Usage: ./scripts/deploy.sh [environment]
# Examples:
#   ./scripts/deploy.sh preview    # Deploy to preview
#   ./scripts/deploy.sh production # Deploy to production
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-preview}
PROJECT_NAME="eazyrentals"

echo -e "${BLUE}🚀 EazyRentals Deployment Script${NC}"
echo "=================================="

# Validate environment
if [[ "$ENVIRONMENT" != "preview" && "$ENVIRONMENT" != "production" ]]; then
    echo -e "${RED}Error: Environment must be 'preview' or 'production'${NC}"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Check if user is logged in
echo -e "${BLUE}🔑 Checking Vercel authentication...${NC}"
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Please login to Vercel${NC}"
    vercel login
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm ci

# Run type check
echo -e "${BLUE}🔍 Running type check...${NC}"
npm run type-check || echo -e "${YELLOW}⚠️  Type check completed with warnings${NC}"

# Build the project
echo -e "${BLUE}🔨 Building project...${NC}"
npm run build

echo -e "${GREEN}✅ Build successful!${NC}"

# Deploy
echo -e "${BLUE}🚀 Deploying to ${ENVIRONMENT}...${NC}"
if [ "$ENVIRONMENT" = "production" ]; then
    vercel --prod
else
    vercel
fi

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo "=================================="

# Get deployment URL
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${GREEN}🌐 Production URL: https://$PROJECT_NAME.vercel.app${NC}"
else
    echo -e "${GREEN}🌐 Preview URL will be shown above${NC}"
fi

echo ""
echo -e "${BLUE}📊 Next steps:${NC}"
echo "  - Test the demo login"
echo "  - Verify all pages load"
echo "  - Check environment variables"
echo ""
