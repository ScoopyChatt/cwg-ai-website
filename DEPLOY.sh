#!/bin/bash

# CWG Website Deployment Script
# This script pushes your website to GitHub and Vercel automatically

set -e

echo "🚀 CWG Website Deployment"
echo "=========================="
echo ""
echo "To complete deployment, you need to:"
echo ""
echo "1. Create a new GitHub repository at https://github.com/new"
echo "   - Name it: cwg-ai-website"
echo "   - Make it PUBLIC (for Vercel)"
echo "   - Don't initialize with README/gitignore (we have those)"
echo ""
echo "2. Copy the command below and paste it into Terminal:"
echo ""
echo "cd ~/.openclaw/workspace/cwg-ai-website"
echo "git remote add origin https://github.com/YOUR_USERNAME/cwg-ai-website.git"
echo "git push -u origin main"
echo ""
echo "3. Connect Vercel to your GitHub repo at https://vercel.com/new"
echo "   - Import from GitHub"
echo "   - Select cwg-ai-website"
echo "   - It will auto-deploy!"
echo ""
