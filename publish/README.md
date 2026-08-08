# Portfolio Management System - Production Publish Directory

This directory contains the production-ready distribution builds for the **Android APK**, **Web Frontend**, and **Python API Backend**.

## 📂 Directory Structure

```
publish/
├── PortfolioApp.apk   # Ready-to-install Android Mobile App APK (~64 MB)
├── frontend/          # Compiled production static files for Web Frontend
│   ├── assets/        # Minified JavaScript & CSS bundles
│   ├── index.html     # Entry point
│   ├── resume.pdf     # Resume document
│   └── icons.svg
└── backend/           # Ready-to-deploy Python API Server
    ├── api_server.py  # Main Python API server
    ├── requirements.txt # Dependencies
    ├── technologies.json # Tech stack data
    └── Start_AI_Server.bat # One-click Windows launcher
```

## 🚀 Deployment & Installation Guide

### 📱 1. Android Mobile App (`PortfolioApp.apk`)
- Transfer `PortfolioApp.apk` to any Android mobile phone.
- Tap the APK file on your device and select **Install**.
- Access all 8 pages (Home, Skills, Projects, Services, Blogs, Analytics, Contact, Admin) and the **Cyber-Glass Quick Menu Drawer**.

### 🌐 2. Web Frontend (`publish/frontend/`)
- Deploy the contents of `publish/frontend/` to any static web host (Vercel, Netlify, Nginx, Apache, IIS, GitHub Pages).
- For local preview: run `npx serve publish/frontend`.

### ⚡ 3. Python API Backend (`publish/backend/`)
- Open terminal in `publish/backend/` and install requirements:
  ```bash
  pip install -r requirements.txt
  ```
- Run server:
  ```bash
  python api_server.py
  ```
- Or double-click `Start_AI_Server.bat` on Windows.
