<div align="center">

# 🌐 ConnectHub

### A Full-Stack Social Media Platform

[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Railway](https://img.shields.io/badge/Railway-131415?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app/)

> **CodeAlpha Internship — Task 2**
> A platform where users can share posts, follow each other, like & comment in real-time.

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Database Schema](#️-database-schema)
- [API Endpoints](#-api-endpoints)
- [Real-Time Events](#-real-time-events-socketio)
- [Pages & Screens](#️-pages--screens)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Known Limitations](#️-known-limitations)

---

## 🧭 Overview

**ConnectHub** is a full-stack social media web application built with React 19, Node.js, Supabase (PostgreSQL), and Socket.io. Users can create accounts, post text/images/videos, follow others, like and comment on posts in real time, and discover content through an engagement-score-based feed.

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🔐 Auth | JWT-based register & login with bcrypt hashing |
| 📝 Posts | Create text, image, and video posts |
| ❤️ Likes | Real-time like/unlike with live count updates |
| 💬 Comments | Real-time comment section via Socket.io |
| 👥 Follow System | Follow/unfollow users, followers/following lists |
| 🔍 Search | Search users and posts by keyword |
| 🌐 Explore | Discover all posts sorted by engagement score |
| 👤 Profiles | Profile page with cover photo, bio, and post grid |
| ✏️ Edit Profile | Update name, bio, username, password, and photos |
| 📡 Real-Time Feed | Live post & engagement updates via Socket.io |
| 📱 Responsive | Fully responsive layout (mobile + desktop) |
| ☁️ Media Storage | Image & video uploads via Supabase Storage |

---

## ⚙️ Tech Stack

### Frontend

| Tool | Purpose |
|------|---------|
| React 19 + Vite | UI framework + build tool |
| React Router DOM v7 | Client-side navigation |
| Tailwind CSS v4 | Utility-first styling |
| Axios | HTTP requests to backend |
| Socket.io-client | Real-time updates |
| React Hook Form | Form state management |
| Zod | Schema-based form validation |
| Context API | Global auth state |

### Backend

| Tool | Purpose |
|------|---------|
| Node.js | JavaScript runtime |
| Express.js | REST API framework |
| JWT (jsonwebtoken) | Authentication tokens |
| bcryptjs | Password hashing |
| Socket.io | Real-time event system |
| Multer | File upload handling |
| dotenv | Environment variable management |
| cors | Cross-origin request handling |

### Database & Storage

| Tool | Purpose |
|------|---------|
| Supabase (PostgreSQL) | Main relational database |
| Supabase Storage | Image & video file hosting |

### Deployment

| Platform | Purpose |
|----------|---------|
| Vercel | Frontend hosting |
| Railway | Backend hosting |

---

## 🗄️ Database Schema

### `users`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PRIMARY KEY | Auto generated |
| name | text | NOT NULL | Full name |
| username | text | UNIQUE, NOT NULL | @handle |
| email | text | UNIQUE, NOT NULL | Login email |
| password | text | NOT NULL | bcrypt hashed |
| bio | text | nullable | Profile description |
| profile_picture | text | nullable | Supabase Storage URL |
| cover_photo | text | nullable | Supabase Storage URL |
| role | text | DEFAULT 'user' | 'user' or 'admin' |
| followers_count | integer | DEFAULT 0 | Cached count |
| following_count | integer | DEFAULT 0 | Cached count |
| posts_count | integer | DEFAULT 0 | Cached count |
| created_at | timestamp | DEFAULT now() | Auto |

### `posts`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PRIMARY KEY | Auto generated |
| user_id | uuid | FK → users.id | Post author |
| content | text | nullable | Text body |
| image_url | text | nullable | Supabase Storage URL |
| video_url | text | nullable | Supabase Storage URL |
| post_type | text | NOT NULL | 'text' / 'image' / 'video' / 'mixed' |
| likes_count | integer | DEFAULT 0 | Cached |
| comments_count | integer | DEFAULT 0 | Cached |
| engagement_score | integer | DEFAULT 0 | likes + comments × 2 |
| created_at | timestamp | DEFAULT now() | Auto |

### `comments`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY |
| post_id | uuid | FK → posts.id |
| user_id | uuid | FK → users.id |
| content | text | NOT NULL |
| created_at | timestamp | DEFAULT now() |

### `likes`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY |
| post_id | uuid | FK → posts.id |
| user_id | uuid | FK → users.id |
| created_at | timestamp | DEFAULT now() |
| UNIQUE | — | (post_id, user_id) — one like per user per post |

### `followers`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY |
| follower_id | uuid | FK → users.id |
| following_id | uuid | FK → users.id |
| created_at | timestamp | DEFAULT now() |
| UNIQUE | — | (follower_id, following_id) |

### `media`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY |
| post_id | uuid | FK → posts.id |
| user_id | uuid | FK → users.id |
| url | text | NOT NULL |
| media_type | text | 'image' or 'video' |
| created_at | timestamp | DEFAULT now() |

### Relationships

```
users ──< posts          (one user → many posts)
users ──< comments       (one user → many comments)
users ──< likes          (one user → many likes)
users ──< followers      (many-to-many via followers table)
posts ──< comments       (one post → many comments)
posts ──< likes          (one post → many likes)
posts ──< media          (one post → many media files)
```

---

## 🔌 API Endpoints

### Auth — `/api/auth`
```
POST   /api/auth/register        Register new user
POST   /api/auth/login           Login, returns JWT token
```

### Users — `/api/users`
```
GET    /api/users/:username           Get profile by username
PUT    /api/users/profile             Edit own profile
POST   /api/users/profile/picture     Upload profile picture
POST   /api/users/profile/cover       Upload cover photo
GET    /api/users/:id/followers       Get followers list
GET    /api/users/:id/following       Get following list
GET    /api/users/search?q=           Search users
```

### Posts — `/api/posts`
```
GET    /api/posts                     All posts (explore, sorted by engagement)
GET    /api/posts/feed                Posts from followed users only
GET    /api/posts/:id                 Single post
POST   /api/posts                     Create new post
DELETE /api/posts/:id                 Delete own post
```

### Comments — `/api/comments`
```
GET    /api/posts/:id/comments        Get all comments on a post
POST   /api/posts/:id/comments        Add comment
DELETE /api/comments/:id              Delete own comment
```

### Likes — `/api/likes`
```
POST   /api/posts/:id/like            Like a post
DELETE /api/posts/:id/like            Unlike a post
GET    /api/posts/:id/likes           Get who liked a post
```

### Follow — `/api/follow`
```
POST   /api/users/:id/follow          Follow a user
DELETE /api/users/:id/follow          Unfollow a user
```

### Search — `/api/search`
```
GET    /api/search?q=&type=           Search users and posts
```

### Media — `/api/media`
```
POST   /api/media/upload              Upload image or video to Supabase Storage
```

---

## ⚡ Real-Time Events (Socket.io)

### Server → Client
| Event | Description |
|-------|-------------|
| `post:liked` | Updates like count live for all viewers |
| `post:commented` | Pushes new comment live without refresh |
| `post:created` | New post appears in feed in real time |
| `user:followed` | Updates follower count live |

### Client → Server
| Event | Description |
|-------|-------------|
| `join:post` | User opens a post page |
| `leave:post` | User leaves a post page |
| `like:post` | User likes a post |
| `comment:post` | User adds a comment |

---

## 🖥️ Pages & Screens

| Route | Page | Auth Required |
|-------|------|:---:|
| `/login` | Login | ❌ |
| `/signup` | Signup | ❌ |
| `/home` | Feed (3-column layout) | ✅ |
| `/explore` | All posts + search + filters | ❌ |
| `/profile/:username` | User profile | ❌ (view) |
| `/profile/edit` | Edit own profile | ✅ |
| `/post/:id` | Single post + comments | ❌ (view) |
| `/search?q=` | Search results (users + posts) | ❌ |
| `/profile/:username/followers` | Followers / Following list | ❌ |

---

## 📁 Project Structure

```
connecthub/
├── frontend/
│   ├── public/
│   └── src/
│       ├── context/
│       │   └── AuthContext.jsx        ← Global auth state
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── PostCard.jsx           ← Reusable post component
│       │   ├── CommentSection.jsx
│       │   ├── UserCard.jsx
│       │   ├── CreatePost.jsx
│       │   ├── LeftSidebar.jsx
│       │   ├── RightSidebar.jsx
│       │   └── FollowButton.jsx
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Signup.jsx
│       │   ├── Home.jsx
│       │   ├── Explore.jsx
│       │   ├── Profile.jsx
│       │   ├── EditProfile.jsx
│       │   ├── PostDetails.jsx
│       │   ├── Search.jsx
│       │   └── Followers.jsx
│       ├── api/
│       │   └── axios.js               ← Axios instance with interceptors
│       ├── socket/
│       │   └── socket.js              ← Socket.io client setup
│       ├── App.jsx
│       └── main.jsx
│
└── backend/
    ├── config/
    │   ├── supabase.js                ← Supabase client
    │   └── socket.js                  ← Socket.io server setup
    ├── controllers/
    │   ├── authController.js
    │   ├── userController.js
    │   ├── postController.js
    │   ├── commentController.js
    │   ├── likeController.js
    │   ├── followController.js
    │   ├── searchController.js
    │   └── mediaController.js
    ├── middleware/
    │   ├── authMiddleware.js          ← JWT protect + adminOnly
    │   └── uploadMiddleware.js        ← Multer config
    ├── routes/
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   ├── postRoutes.js
    │   ├── commentRoutes.js
    │   ├── likeRoutes.js
    │   ├── followRoutes.js
    │   ├── searchRoutes.js
    │   └── mediaRoutes.js
    ├── server.js
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- A [Supabase](https://supabase.com/) project with tables created

### 1. Clone the repo

```bash
git clone https://github.com/AAbdullahRajput/connecthub.git
cd connecthub
```

### 2. Setup Backend

```bash
cd backend
npm install
# Create .env file (see Environment Variables below)
node server.js
```

### 3. Setup Frontend

```bash
cd frontend
npm install
# Create .env file (see Environment Variables below)
npm run dev
```

---

## 🌐 Environment Variables

### `backend/.env`

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_key
PORT=5000
SUPABASE_STORAGE_BUCKET=connecthub-media
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## ☁️ Deployment

| Service | Platform | Notes |
|---------|----------|-------|
| Frontend | [Vercel](https://vercel.com/) | Set `VITE_API_URL` to Railway backend URL |
| Backend | [Railway](https://railway.app/) | Set all backend env variables |

> Make sure to update CORS origins in `server.js` to your Vercel deployment URL before production deploy.

---

## 🏗️ Build Order Reference

```
Phase 1 — Setup & Config
  → Project folders, Supabase tables, Storage buckets, server.js + Socket.io

Phase 2 — Auth
  → Register/Login API, Login/Signup pages, JWT middleware

Phase 3 — Core Features
  → Post CRUD, Home feed, Like system (real-time), Comment system (real-time)

Phase 4 — Social Features
  → Follow system, Profile page, Edit profile, Followers/Following page

Phase 5 — Discovery
  → Explore page, Search (users + posts)

Phase 6 — Polish & Deploy
  → Engagement score sorting, Real-time feed, Responsive design, Deploy
```

---

## ⚠️ Known Limitations

- No notifications system
- No direct messages (DMs)
- No stories feature
- No post editing (delete only)
- Basic engagement-score algorithm
- No content moderation or reporting
- Sessions stored in `localStorage` (not httpOnly cookies)
- No email verification on signup

---

## 👨‍💻 Author

**Ahmad Abdullah**
- GitHub: [@AAbdullahRajput](https://github.com/AAbdullahRajput)
- Email: ahmadabdullah4972@gmail.com

---

<div align="center">
  <p>Made with 💙 by <a href="https://github.com/AAbdullahRajput">Ahmad Abdullah</a></p>
  <p><i>⭐ If you found this project helpful, consider giving it a star!</i></p>
</div>
