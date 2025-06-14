#!/bin/bash

PROJECT=$1
ENVIRONMENTS=$2

if [ -z "$PROJECT" ] || [ -z "$ENVIRONMENTS" ]; then
  echo "Usage: ./setup-new-project.sh <project> <env1,env2,env3>"
  echo "Example: ./setup-new-project.sh myapp dev,staging,prod"
  exit 1
fi

echo "🚀 Setting up project: $PROJECT"

# Create directories
echo "📁 Creating directory structure..."
mkdir -p src/pages/$PROJECT/{auth,dashboard,settings}
mkdir -p tests/$PROJECT/{auth,smoke,regression}

# Create environment files
echo "🌍 Creating environment files..."
IFS=',' read -ra ENVS <<< "$ENVIRONMENTS"
for env in "${ENVS[@]}"; do
  if [ ! -f "config/.env.$PROJECT.$env" ]; then
    cp config/.env.template config/.env.$PROJECT.$env
    # Replace placeholders
    sed -i.bak "s/{project}/$PROJECT/g" config/.env.$PROJECT.$env
    sed -i.bak "s/{env}/$env/g" config/.env.$PROJECT.$env
    sed -i.bak "s/{PROJECT}/${PROJECT^^}/g" config/.env.$PROJECT.$env
    sed -i.bak "s/{ENVIRONMENT}/${env^^}/g" config/.env.$PROJECT.$env
    rm config/.env.$PROJECT.$env.bak
    echo "✅ Created .env.$PROJECT.$env"
  else
    echo "⚠️  .env.$PROJECT.$env already exists, skipping"
  fi
done

# Create basic page object structure
echo "📄 Creating basic page objects..."
cat > src/pages/$PROJECT/index.ts << EOF
// Export all $PROJECT page objects
export * from './auth/loginPage';
export * from './auth/registrationPage';
EOF

# Create basic test structure
echo "🧪 Creating basic test structure..."
cat > tests/$PROJECT/smoke/basic.spec.ts << EOF
import { test, expect } from '@fixtures/testData.fixture';

test.describe('$PROJECT - Smoke Tests', { 
  tag: ['@$PROJECT', '@smoke'] 
}, () => {
  
  test('Homepage loads successfully', { 
    tag: ['@p1'] 
  }, async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
  });
});
EOF

echo "✅ Project $PROJECT setup complete!"
echo ""
echo "Next steps:"
echo "1. Update the environment files in config/"
echo "2. Create page objects in src/pages/$PROJECT/"
echo "3. Write tests in tests/$PROJECT/"
echo "4. Run tests with: PROJECT=$PROJECT ENV=dev pnpm run test:$PROJECT"