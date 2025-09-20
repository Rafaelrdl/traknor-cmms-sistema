#!/bin/bash

echo "🚀 Optimizing TrakNor CMMS development environment..."

# Clear previous build artifacts
echo "🧹 Cleaning build artifacts..."
rm -rf dist/
rm -rf node_modules/.vite/
rm -rf node_modules/.tmp/

# Pre-optimize dependencies
echo "📦 Pre-optimizing dependencies..."
npm run optimize

# Warm up TypeScript checking
echo "📝 Warming up TypeScript..."
npx tsc --noEmit --skipLibCheck

# Create optimized .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "⚙️ Creating optimized development configuration..."
    cat > .env.local << EOF
# Development optimizations
VITE_DEV_FAST_REFRESH=true
VITE_DEV_SKIP_ENV_VALIDATION=true
NODE_OPTIONS="--max-old-space-size=4096"
EOF
fi

echo "✅ Development environment optimized!"
echo ""
echo "🎯 Performance Tips:"
echo "  • Use 'npm run dev' for fast development server"
echo "  • Use 'npm run build:fast' for optimized production builds"
echo "  • Use 'npm run build:analyze' to analyze bundle size"
echo "  • Clear node_modules/.vite/ if you encounter dependency issues"
echo ""