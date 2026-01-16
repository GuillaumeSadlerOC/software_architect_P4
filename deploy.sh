#!/bin/bash

GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}🚀 Démarrage du déploiement de DataShare...${NC}"

# 1. Env
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
else
    echo -e "${GREEN}✅ .env file present.${NC}"
fi

# 2. Launching containers (Build & Detach)
echo "🐳 Launching Docker containers..."
docker compose down
docker compose up -d --build

# 3. Awaiting database availability (Basic Healthcheck)
echo "⏳ Waiting for services to start..."
sleep 5 # We allow 5 seconds for Postgres to initialize

# 4. Confirmation
echo -e "${GREEN}✨ Deployment successfully completed !${NC}"
echo "🌍 Frontend : http://datashare.localhost"
echo "🔌 API : http://api.datashare.localhost"
echo "📄 Swagger : http://api.datashare.localhost/api/docs"
