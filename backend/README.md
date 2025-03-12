# BlogMind API Documentation

## Overview
This document provides the API documentation for the BlogMind application, which is a blog platform. The API is built using FastAPI and includes various endpoints for user management, blog management, comments, uploads, analytics, and authentication.

## Base URL
The base URL for the API is: 
## Authentication Endpoints

### Register
- **Endpoint:** `POST /api/auth/register`
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string",
    "name": "string"
  }
  ```
- **Response:**
  ```json
  {
    "id": "string",
    "email": "string",
    "name": "string"
  }
  ```

### Login
- **Endpoint:** `POST /api/auth/login`
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "access_token": "string",
    "token_type": "string"
  }
  ```

## User Endpoints

### Get Current User
- **Endpoint:** `GET /api/users/me`
- **Response:**
  ```json
  {
    "id": "string",
    "email": "string",
    "name": "string",
    "bio": "string"
  }
  ```

### Update Current User
- **Endpoint:** `PUT /api/users/me`
- **Request Body:**
  ```json
  {
    "name": "string",
    "bio": "string"
  }
  ```
- **Response:**
  ```json
  {
    "id": "string",
    "email": "string",
    "name": "string",
    "bio": "string"
  }
  ```

### Get User Blogs
- **Endpoint:** `GET /api/users/blogs`
- **Response:**
  ```json
  [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "created_at": "string"
    }
  ]
  ```

### Get Liked Blogs
- **Endpoint:** `GET /api/users/liked`
- **Response:** Same structure as Get User Blogs.

### Get User Comments
- **Endpoint:** `GET /api/users/comments`
- **Response:**
  ```json
  [
    {
      "id": "string",
      "content": "string",
      "created_at": "string",
      "blog": {
        "id": "string",
        "title": "string",
        "slug": "string"
      }
    }
  ]
  ```

## Blog Endpoints

### Create Blog Post
- **Endpoint:** `POST /api/blogs`
- **Request Body:**
  ```json
  {
    "title": "string",
    "content": "string",
    "category_id": "string"
  }
  ```
- **Response:**
  ```json
  {
    "id": "string",
    "title": "string",
    "content": "string",
    "created_at": "string"
  }
  ```

### Get All Blogs
- **Endpoint:** `GET /api/blogs`
- **Response:**
  ```json
  [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "created_at": "string"
    }
  ]
  ```

### Get Blog by Slug
- **Endpoint:** `GET /api/blogs/{slug}`
- **Response:** Same structure as Get All Blogs.

### Update Blog Post
- **Endpoint:** `PUT /api/blogs/{blog_id}`
- **Request Body:** Same as Create Blog Post.
- **Response:** Same as Create Blog Post.

### Delete Blog Post
- **Endpoint:** `DELETE /api/blogs/{blog_id}`
- **Response:** `204 No Content`

### Like Blog Post
- **Endpoint:** `POST /api/blogs/{slug}/like`
- **Response:**
  ```json
  {
    "message": "Blog like status updated"
  }
  ```

## Comment Endpoints

### Create Comment
- **Endpoint:** `POST /api/comments`
- **Request Body:**
  ```json
  {
    "content": "string",
    "blog_id": "string"
  }
  ```
- **Response:**
  ```json
  {
    "id": "string",
    "content": "string",
    "created_at": "string"
  }
  ```

### Get Comments for Blog
- **Endpoint:** `GET /api/comments/blog/{blog_id}`
- **Response:**
  ```json
  [
    {
      "id": "string",
      "content": "string",
      "created_at": "string"
    }
  ]
  ```

### Update Comment
- **Endpoint:** `PUT /api/comments/{comment_id}`
- **Request Body:**
  ```json
  {
    "content": "string"
  }
  ```
- **Response:** Same as Create Comment.

### Delete Comment
- **Endpoint:** `DELETE /api/comments/{comment_id}`
- **Response:** `204 No Content`

## Upload Endpoints

### Upload Avatar
- **Endpoint:** `POST /api/uploads/avatar`
- **Request Body:** Multipart form data with the avatar file.

### Upload Blog Image
- **Endpoint:** `POST /api/uploads/blog-image`
- **Request Body:** Multipart form data with the blog image file.

### Get Upload
- **Endpoint:** `GET /api/uploads/{folder}/{filename}`
- **Response:** The requested file.

## Analytics Endpoints

### Record Blog View
- **Endpoint:** `POST /api/analytics/view/{slug}`
- **Request Body:** None.

### Record Read Progress
- **Endpoint:** `POST /api/analytics/read-progress/{slug}`
- **Request Body:** None.

### Get Blog Analytics
- **Endpoint:** `GET /api/analytics/blog/{slug}`
- **Response:** Blog analytics data.

### Get User Analytics
- **Endpoint:** `GET /api/analytics/user`
- **Response:** User analytics data.

## Default Endpoint

### Root
- **Endpoint:** `GET /`
- **Response:**
  ```json
  {
    "message": "Welcome to BlogMind API"
  }
