#!/bin/bash

# Script to synchronize src files with the example
# Avoids having to manually copy files every time

echo "🔄 Synchronizing src with example..."

# Verify we are in the correct directory
if [ ! -d "src" ] || [ ! -d "example" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

# Remove the old src folder from example
if [ -d "example/src" ]; then
    echo "🗑️  Removing old example/src folder..."
    rm -rf example/src
fi

# Copy the new src folder
echo "📁 Copying src -> example/src..."
cp -r src example/

# Verify the copy was successful
if [ -d "example/src" ]; then
    echo "✅ Synchronization completed!"
    echo "📊 Files copied:"
    find example/src -name "*.ts" -o -name "*.tsx" | sed 's/^/   - /'
else
    echo "❌ Error during copy"
    exit 1
fi

echo ""
echo "🚀 You can now run from inside the example folder: npx expo start --clear" 