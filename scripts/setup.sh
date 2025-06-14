#!/bin/bash

echo "🎭 Setting up Playwright Framework..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first:"
    echo "   npm install -g pnpm"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
pnpm playwright install --with-deps

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x scripts/*.sh

# Create additional directories if they don't exist
echo "📁 Creating directories..."
mkdir -p test-results
mkdir -p screenshots
mkdir -p videos
mkdir -p traces

# Run health check
echo "🏥 Running health check..."
if pnpm run health-check; then
    echo ""
    echo "✅ Setup completed successfully!"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Review and update environment files in config/"
    echo "   2. Run the interactive test runner: pnpm run test:interactive"
    echo "   3. Or run specific tests: PROJECT=pcf ENV=dev pnpm run test:pcf"
    echo ""
    echo "📚 Documentation: See README.md for detailed usage instructions"
else
    echo ""
    echo "⚠️  Setup completed with warnings. Check the health check output above."
    echo "   Some environment files may need to be configured."
fi