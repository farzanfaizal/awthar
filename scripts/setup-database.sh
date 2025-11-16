#!/bin/bash

# Database Setup Script for Awthar
# This script initializes the database schema using Drizzle

set -e

echo "🚀 Setting up Awthar database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo "Please set DATABASE_URL before running this script"
    exit 1
fi

echo "✅ DATABASE_URL is configured"

# Run database migrations
echo "📊 Pushing database schema..."
npm run db:push

echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Optionally seed your database with initial data"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Or run 'npm run build && npm start' for production"
