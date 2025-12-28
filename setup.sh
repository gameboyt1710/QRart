#!/bin/bash

# QRart Setup Script
# This script helps you get started with QRart development

set -e

echo "🎨 QRart Setup Script"
echo "===================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the QRart root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Setup backend
echo "🔧 Setting up backend..."
cd apps/backend

if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit apps/backend/.env with your database connection"
else
    echo ".env already exists"
fi

echo "✅ Backend setup complete"
echo ""

# Setup web
echo "🌐 Setting up web UI..."
cd ../web

if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
else
    echo ".env already exists"
fi

echo "✅ Web UI setup complete"
echo ""

cd ../..

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "==========="
echo ""
echo "1. Start PostgreSQL database:"
echo "   docker run --name qrart-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=qrart -p 5432:5432 -d postgres:15"
echo ""
echo "2. Run database migrations:"
echo "   cd apps/backend"
echo "   npm run prisma:migrate"
echo "   npm run prisma:seed"
echo ""
echo "3. Start the backend (in one terminal):"
echo "   cd apps/backend"
echo "   npm run dev"
echo ""
echo "4. Start the web UI (in another terminal):"
echo "   cd apps/web"
echo "   npm run dev"
echo ""
echo "5. Build the extension:"
echo "   cd apps/extension"
echo "   npm run build"
echo "   Then load dist/ folder in chrome://extensions"
echo ""
echo "🚀 For Railway deployment, see RAILWAY.md"
echo ""
