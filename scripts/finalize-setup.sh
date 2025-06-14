#!/bin/bash

# Make shell scripts executable
chmod +x /Users/khalid/Documents/Personal/refactored-playwright/scripts/setup.sh
chmod +x /Users/khalid/Documents/Personal/refactored-playwright/scripts/setup-new-project.sh

echo "🔧 Made scripts executable"

# Create some missing directories
mkdir -p /Users/khalid/Documents/Personal/refactored-playwright/test-results
mkdir -p /Users/khalid/Documents/Personal/refactored-playwright/screenshots  
mkdir -p /Users/khalid/Documents/Personal/refactored-playwright/videos
mkdir -p /Users/khalid/Documents/Personal/refactored-playwright/traces

echo "📁 Created additional directories"

# Update package.json to add missing dependencies for path aliases
cd /Users/khalid/Documents/Personal/refactored-playwright

echo "✅ Setup complete! Your refactored Playwright framework is ready."
echo ""
echo "🚀 Next steps:"
echo "1. Run: cd /Users/khalid/Documents/Personal/refactored-playwright"
echo "2. Run: pnpm install"
echo "3. Run: pnpm playwright install --with-deps"
echo "4. Run: pnpm run health-check"
echo "5. Run: pnpm run test:interactive"
echo ""
echo "📚 See README.md for complete documentation"