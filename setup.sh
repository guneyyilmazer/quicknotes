#!/bin/bash

# QuickNotes Setup Script
echo "🚀 Setting up QuickNotes..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ Created .env file. Please review and update if needed."
else
    echo "✅ .env file already exists."
fi

# Create directories if they don't exist
echo "📁 Creating directories..."
mkdir -p backend frontend nginx

# Make setup script executable
chmod +x setup.sh

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Review and update the .env file if needed"
echo "2. Implement your backend and frontend code"
echo "3. Run one of the following commands:"
echo ""
echo "   For development (with live reload):"
echo "   make dev"
echo ""
echo "   For production:"
echo "   make prod"
echo ""
echo "   To see all available commands:"
echo "   make help"
echo ""
echo "📚 See README.md for detailed instructions." 