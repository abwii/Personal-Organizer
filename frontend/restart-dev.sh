#!/bin/bash
echo "Cleaning Angular cache..."
rm -rf .angular/cache
rm -rf node_modules/.cache
echo "Cache cleaned. Please restart the Docker container:"
echo "  docker compose restart frontend"
echo "Or rebuild:"
echo "  docker compose up -d --build frontend"
