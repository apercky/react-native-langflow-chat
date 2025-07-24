#!/bin/bash

# Script to clean the example src folder
# Removes the copied src files from the example directory

echo "🧹 Cleaning example src folder..."

# Verify we are in the correct directory
if [ ! -d "src" ] || [ ! -d "example" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

# Remove the old src folder from example
if [ -d "example/src" ]; then
    echo "🗑️  Removing example/src folder..."
    rm -rf example/src
fi


echo ""
echo "✅ Example folder cleaned successfully" 