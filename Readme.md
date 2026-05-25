# 🎥 VidHub - Backend for a Video Platform

VidHub is a production-oriented backend for a YouTube-like video platform built using Node.js, Express.js, MongoDB, Redis, and Cloudinary.

It supports secure authentication, video uploads, subscriptions, playlists, comments, likes, tweets, watch history, and creator analytics.

In addition to core platform features, VidHub also focuses on backend engineering concepts such as centralized request validation, rate limiting, Redis caching, aggregation-heavy analytics, and scalable middleware architecture.

<hr style="height:5px;border:none;color:#333;background-color:#333;">

# 🚀 Live API & Documentation

## Live Backend (Render)

👉 https://vidhub-backend.onrender.com

## Public API Documentation (Postman)

👉 https://documenter.getpostman.com/view/54296440/2sBXwmPY7G

<hr style="height:5px;border:none;color:#333;background-color:#333;">

# ⚙️ Installation & Setup

## 1. Clone the repository

```bash
git clone https://github.com/yasmalhotraa/vidhub-backend.git
cd vidhub-backend
```

## 2. Install dependencies

```bash
npm install
```

## 3. Create a `.env` file

```env
PORT=8000

MONGODB_URI=your_mongodb_connection_string

ACCESS_TOKEN_SECRET=your_access_secret
ACCESS_TOKEN_EXPIRY=15m

REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

REDIS_URL=your_redis_connection_url

CORS_ORIGIN=http://localhost:3000

NODE_ENV=your-environment
```

## 4. Run the server

```bash
npm run dev
```

## API Base URL

```bash
http://localhost:8000/api/v1
```

<hr style="height:5px;border:none;color:#333;background-color:#333;">

# 🧠 System Architecture

VidHub follows a scalable client-server architecture with CDN-based media delivery and Redis cache-aside optimization.

## Architecture Diagram

👉 https://drive.google.com/file/d/1PVY35KN4ck_zP7c4D8KltXtfrm90mQ-J/view?usp=sharing

## High-Level Flow

```text
Client → VidHub API → Middleware Layer → Controllers → Redis Cache Check → MongoDB

Client ← Cloudinary CDN

VidHub API → Multer → Cloudinary (Media Uploads)

MongoDB → Redis (Cache Storage with TTL)
```

<hr style="height:5px;border:none;color:#333;background-color:#333;">

# 📊 Database Schema

The database is designed to support a complete social video-sharing platform.

## Data Model Diagram

👉 https://drive.google.com/file/d/19HAX5tZ-kt0meB9JaSFARYHgf0i0LQa2/view?usp=sharing

## Collections

- Users
- Videos
- Comments
- Likes
- Subscriptions
- Playlists
- Tweets

<hr style="height:5px;border:none;color:#333;background-color:#333;">

# 🚀 Features

## 🔐 Authentication & Security

- JWT Access & Refresh Tokens
- HttpOnly Cookies & Bearer Token Support
- Password Hashing using bcrypt
- Route-Level Authorization Middleware
- Centralized Error Handling
- Global & Route-Specific Rate Limiting

---

## 👤 Users & Channels

- User Registration & Login
- Avatar & Cover Image Uploads
- Channel Profiles with Subscriber Count
- Watch History Tracking
- Password & Profile Updates

---

## 📹 Video Platform

- Video & Thumbnail Uploads
- Cloudinary CDN-Based Media Storage
- Publish / Unpublish Videos
- Ownership-Based Access Control
- Paginated Video Feeds
- Query-Based Video Search & Sorting

---

## 💬 Comments

- Add, Update & Delete Comments
- Paginated Comment Feeds
- Comment Ownership Validation
- Comment Like Integration

---

## ❤️ Likes

- Like Videos, Comments & Tweets
- Toggle-Based Like System
- Fetch Liked Videos

---

## 🧵 Tweets

- Create, Update & Delete Tweets
- Fetch Tweets by User
- Tweet Like Support

---

## 📁 Playlists

- Create, Update & Delete Playlists
- Add / Remove Videos from Playlists
- Duplicate Prevention
- Fetch User Playlists

---

## 📺 Subscriptions

- Subscribe / Unsubscribe Channels
- Fetch Channel Subscribers
- Fetch User Subscribed Channels

---

## 📊 Creator Dashboard

- Total Videos
- Total Views
- Total Subscribers
- Uploaded Channel Videos
- Aggregation-Based Analytics

<hr style="height:5px;border:none;color:#333;background-color:#333;">

# 🛠 Tech Stack

| Category          | Technologies                  |
| ----------------- | ----------------------------- |
| Backend           | Node.js, Express.js           |
| Database          | MongoDB Atlas                 |
| Authentication    | JWT (Access & Refresh Tokens) |
| Media Storage     | Cloudinary                    |
| File Uploads      | Multer                        |
| Validation        | Zod                           |
| Caching           | Redis                         |
| Rate Limiting     | express-rate-limit            |
| Database ODM      | Mongoose                      |
| API Documentation | Postman                       |

<hr style="height:5px;border:none;color:#333;background-color:#333;">

# 🗂 Project Structure

```text
src/
├── controllers/        # Route controllers & business operations
├── middlewares/        # Auth, validation, rate limiting & uploads
├── validators/         # Zod validation schemas
├── models/             # MongoDB schemas
├── routes/             # API route definitions
├── utils/              # Helpers & utilities
├── db/                 # Database connection setup
├── app.js
└── index.js
```

<hr style="height:5px;border:none;color:#333;background-color:#333;">

# 📌 Why This Project

VidHub demonstrates how a production-oriented backend system can be designed for a modern video-sharing platform.

This project focuses not only on feature implementation but also on scalable backend engineering concepts such as:

- Secure authentication systems
- Middleware-oriented architecture
- Redis caching strategies
- Centralized validation systems
- Aggregation-heavy analytics
- Rate limiting & API protection
- CDN-based media delivery
- Modular and maintainable backend structure

<hr style="height:5px;border:none;color:#333;background-color:#333;">

# 🧾 License

MIT
