# 🚀 BlogMind API Documentation  
> **A Powerful & Scalable Blog API Built with FastAPI**  

📌 **Base URL:** `http://localhost:8000/api`  

BlogMind is a full-featured **blogging API** designed for **speed, security, and scalability**. This API provides endpoints for **user authentication, blog management, comments, analytics, and file uploads**.  

---

## 🔐 **Authentication Endpoints**  
### 📝 **Register**
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

### 🔑 **Login**
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

## 👤 **User Endpoints :**

### 🔎 Get Current User
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

### ✏️ **Update Profile**
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

### 📝 **Get User's Blogs**
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

### ❤️ **Get Liked Blogs**
- **Endpoint:** `GET /api/users/liked`
- **Response:** Same structure as Get User Blogs.

### 💬 **Get User Comments**
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

## 📰 Blog Endpoints

### ➕ **Create Blog**
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

### 📚 **Get All Blogs**
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

### 🔎 **Get Blog by Slug**
- **Endpoint:** `GET /api/blogs/{slug}`
- **Response:** Same structure as Get All Blogs.

### ✏️ **Update Blog**
- **Endpoint:** `PUT /api/blogs/{blog_id}`
- **Request Body:** Same as Create Blog Post.
- **Response:** Same as Create Blog Post.

### ❌ **Delete Blog**
- **Endpoint:** `DELETE /api/blogs/{blog_id}`
- **Response:** `204 No Content`

### ❤️ **Like Blog**
- **Endpoint:** `POST /api/blogs/{slug}/like`
- **Response:**
  ```json
  {
    "message": "Blog like status updated"
  }
  ```



## 💬 **Comment Endpoints**

### ➕ **Add Comment**
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

### 📖 **Get Blog Comments**
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

### ✏️ **Edit Comment**
- **Endpoint:** `PUT /api/comments/{comment_id}`
- **Request Body:**
  ```json
  {
    "content": "string"
  }
  ```
- **Response:** Same as Create Comment.

### ❌ **Delete Comment**
- **Endpoint:** `DELETE /api/comments/{comment_id}`
- **Response:** `204 No Content`

## 📤 **Upload Endpoints**

### 🏞️ **Upload Avatar**
- **Endpoint:** `POST /api/uploads/avatar`
- **Request Body:** Multipart form data with the avatar file.

### 🏞️ **Upload Blog Image**
- **Endpoint:** `POST /api/uploads/blog-image`
- **Request Body:** Multipart form data with the blog image file.

### 🔗 **Get Uploaded File**
- **Endpoint:** `GET /api/uploads/{folder}/{filename}`
- **Response:** The requested file.

## 📊 **Analytics Endpoints**

### 👀 **Track Blog View**
- **Endpoint:** `POST /api/analytics/view/{slug}`
- **Request Body:** None.

### 📖 **Track Read Progress**
- **Endpoint:** `POST /api/analytics/read-progress/{slug}`
- **Request Body:** None.

### 📊 **Get Blog Analytics**
- **Endpoint:** `GET /api/analytics/blog/{slug}`
- **Response:** Blog analytics data.

### 📊 **Get User Analytics**
- **Endpoint:** `GET /api/analytics/user`
- **Response:** User analytics data.

## 🌍 **Default Endpoint**

### 🏠 **Root**
- **Endpoint:** `GET /`
- **Response:**
  ```json
  {
    "message": "Welcome to BlogMind API"
  }
  ```



## 🚀 **Getting Started**
### 🔗 **Prerequisites**
Ensure you have the following installed:  
- **Python 3.11.5 or higher**  
- **pip**  

### 📥 **Installation**
1️⃣ **Clone the repository:**
```sh
git clone https://github.com/itz-shakil-92/BlogMind-App.git
cd BlogMind-App/backend
```
### **2️⃣ Create a Virtual Environment**
Run the following command to create and activate a virtual environment:

```sh
# Create virtual environment
python -m venv venv

# Activate venv (Windows)
venv\Scripts\activate

# Activate venv (Mac/Linux)
source venv/bin/activate
```
3️⃣ **Install dependencies:**
```sh
pip install -r requirments.txt
```

4️⃣ **Set Up Environment Variables:**
Create a .env file inside the frontend/ directory and add:

## MongoDB settings
```env
MONGODB_URL=mongodb://localhost:27017
```

if you want to use a different MongoDB instance, replace the URL with your own.
```env
MONGODB_URL="Your_MongoDB_URL"
```

## Security settings
```env
SECRET_KEY="Your_secret_key"
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

## Application settings
```env
API_URL=http://localhost:8000/api
FRONTEND_URL=http://localhost:3000
UPLOAD_DIR=uploads
```

## Email settings (optional - for email notifications)
```env
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-email-password
MAIL_FROM=noreply@xyz.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
MAIL_FROM_NAME=BlogMind
MAIL_TLS=True
MAIL_SSL=False
MAIL_USE_CREDENTIALS=True
MAIL_VALIDATE_CERTS=True
```


5️⃣ 🚀 **Start Development Server:**
```sh
uvicorn main:app --reload
```
🔗 Open http://localhost:8000 in your browser.


6️⃣ **🛠️ For Testing the API:**

#### 📌 **Open Swagger API Docs in your browser:**
🔗 http://localhost:8000/api/docs
#### 📌 **Open Redoc API Docs:**
🔗 http://localhost:8000/api/redoc



## 🚀 Production Build & Deployment

### **For deploying the FastAPI backend in production, follow these steps:**

**1️⃣ Install Production Dependencies
Ensure you have Uvicorn with Gunicorn installed:**
```sh
pip install "uvicorn[standard]" gunicorn
```

**2️⃣ Run the API in Production Mode:**
```sh
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

## 📌 **Deploy Easily on:**
  
**Render:** Deploy your backend on render with github repository or manual upload.


## 📧 Contact & Contributions

💡 Contributions are Welcome! Open an Issue or Pull Request anytime.

📌 **Author:** Shakil Kathat   
🔗 **LinkedIn:** [Shakil Kathat](https://www.linkedin.com/in/shakilkathat92/)   
🌍 **Project Repository:** [GitHub](https://github.com/itz-shakil-92/BlogMind-App.git)

