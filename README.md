# Food Ordering App

## Overview
A full-stack web application for food ordering with Role-Based Access Control (RBAC) and Regional Data Isolation.

## Tech Stack
- **Framework**: NestJS (Node.js)
- **Database**: SQLite with Prisma ORM
- **Language**: TypeScript

## Prerequisites
- Node.js (v18+)
- NPM

## Setup Instructions

1.  **Install Dependencies**
    ```bash
    cd server
    npm install
    ```

2.  **Database Setup**
    The app uses SQLite.
    ```bash
    # Generate Prisma Client
    npx prisma generate
    
    # Push Schema to DB
    npx prisma db push
    
    # Seed Data (Users, Restaurants, Menu Items)
    npx prisma db seed
    ```

3.  **Run Application**
4.  Change the baseUrl in api.ts in services Folder to this value 'http://localhost:3000'
    ```bash
    # Development Mode
    npm run start:dev
    ```
    The server runs on 'http://localhost:3000'.

## Architecture Details
See [ARCHITECTURE.md](./ARCHITECTURE.md) for design details.

## API Documentation
See [API_COLLECTION.md](./API_COLLECTION.md) for endpoints and usage.
