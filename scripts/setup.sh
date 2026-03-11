#!/bin/bash

# =============================================================================
# EazyRentals Setup Script
# =============================================================================
# Usage: ./scripts/setup.sh
# This script sets up the development environment
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 EazyRentals Setup Script${NC}"
echo "=================================="

# Check Node.js version
echo -e "${BLUE}🔍 Checking Node.js version...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18 or higher.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18 or higher is required. Found: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) found${NC}"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Copy environment file
echo -e "${BLUE}⚙️  Setting up environment...${NC}"
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo -e "${GREEN}✅ Created .env.local from .env.example${NC}"
else
    echo -e "${YELLOW}⚠️  .env.local already exists${NC}"
fi

# Create necessary directories
echo -e "${BLUE}📁 Creating directories...${NC}"
mkdir -p .next
mkdir -p node_modules

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo "=================================="
echo ""
echo -e "${BLUE}🎉 Next steps:${NC}"
echo ""
echo "  1. Start development server:"
echo -e "     ${YELLOW}npm run dev${NC}"
echo ""
echo "  2. Open browser at:"
echo -e "     ${YELLOW}http://localhost:3000${NC}"
echo ""
echo "  3. Try the demo login:"
echo "     - Admin: demo@admin.com"
echo "     - Agent: demo@agent.com"
echo "     - Tenant: demo@tenant.com"
echo ""
echo "  4. Deploy to Vercel:"
echo -e "     ${YELLOW}./scripts/deploy.sh production${NC}"
echo ""
