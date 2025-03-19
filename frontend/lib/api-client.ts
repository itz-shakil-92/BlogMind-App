import axios from "axios"
import Cookies from "js-cookie"

// Base API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL


//console.log("Using API URL:", API_URL) //this is for debugging

// Function to check if the server is reachable
async function checkServerStatus() {
  try {
    const response = await fetch(`${API_URL}/`, { method: "GET" });
    if (!response.ok) throw new Error("Server not reachable");
  } catch (error) {
    document.body.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <h1 style="color: red;">Server is Down</h1>
        <p>Please try again later.</p>
      </div>
    `;
    throw new Error("Server is down");
  }
}

// Check the server before making requests
checkServerStatus();

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage or cookie
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || Cookies.get("token") : null

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Auth API
export const authApi = {
  // Register a new user
  register: async (userData) => {
    const response = await axiosInstance.post("/api/auth/register", userData)
    return response.data
  },

  // Login user
  login: async (email, password) => {
    const formData = new FormData()
    formData.append("username", email)
    formData.append("password", password)

    const response = await axiosInstance.post("/api/auth/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    return response.data
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await axiosInstance.get("/api/users/me")
    return response.data
  },

  // Update user profile
  updateUser: async (userData) => {
    const response = await axiosInstance.put("/api/users/me", userData)
    return response.data
  },
}

// Blog API
export const blogApi = {
  // Get all blogs with optional filtering
  getBlogs: async (params = {}) => {
    console.log("Fetching blogs with params:", params)
    const response = await axiosInstance.get("/api/blogs", { params })
    return response.data
  },

  // Get blog by slug
  getBlogBySlug: async (slug) => {
    const response = await axiosInstance.get(`/api/blogs/${slug}`)
    return response.data
  },

  // Create new blog
  createBlog: async (blogData) => {
    const response = await axiosInstance.post("/api/blogs", blogData)
    return response.data
  },

  // Update blog
  updateBlog: async (id, blogData) => {
    const response = await axiosInstance.put(`/api/blogs/${id}`, blogData)
    return response.data
  },

  // Delete blog
  deleteBlog: async (id) => {
    await axiosInstance.delete(`/api/blogs/${id}`)
  },

  // Like/unlike blog
  likeBlog: async (slug) => {
    const response = await axiosInstance.post(`/api/blogs/${slug}/like`)
    return response.data
  },

  // Get categories
  getCategories: async () => {
    const response = await axiosInstance.get("/api/blogs/categories")
    return response.data
  },

  // Get user blogs
  getUserBlogs: async () => {
    const response = await axiosInstance.get("/api/users/blogs")
    return response.data
  },

  // Get liked blogs
  getLikedBlogs: async () => {
    const response = await axiosInstance.get("/api/users/liked")
    return response.data
  },
}

// Comments API
export const commentApi = {
  // Get comments for a blog
  getComments: async (blogId) => {
    const response = await axiosInstance.get(`/api/comments/blog/${blogId}`)
    return response.data
  },

  // Create comment
  addComment: async (blogId, content) => {
    const response = await axiosInstance.post("/api/comments", { blog_id: blogId, content })
    return response.data
  },

  // Get user comments
  getUserComments: async () => {
    const response = await axiosInstance.get("/api/users/comments")
    return response.data
  },

  // Update comment
  updateComment: async (id, commentData) => {
    const response = await axiosInstance.put(`/api/comments/${id}`, commentData)
    return response.data
  },

  // Delete comment
  deleteComment: async (id) => {
    await axiosInstance.delete(`/api/comments/${id}`)
  },
}

// Upload API
export const uploadApi = {
  // Upload avatar
  uploadAvatar: async (file) => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await axiosInstance.post("/api/uploads/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  // Upload blog image
  uploadBlogImage: async (file) => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await axiosInstance.post("/api/uploads/blog-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },
}

// Analytics API
export const analyticsApi = {
  // Record blog view
  recordBlogView: async (slug, referrer = null) => {
    const data = { referrer }
    const response = await axiosInstance.post(`/api/analytics/view/${slug}`, data)
    return response.data
  },

  // Record read progress
  recordReadProgress: async (slug, readPercentage) => {
    const data = { read_percentage: readPercentage }
    const response = await axiosInstance.post(`/api/analytics/read-progress/${slug}`, data)
    return response.data
  },

  // Get blog analytics
  getBlogAnalytics: async (slug, days = 30) => {
    const response = await axiosInstance.get(`/api/analytics/blog/${slug}`, {
      params: { days },
    })
    return response.data
  },

  // Get user analytics
  getUserAnalytics: async (days = 30) => {
    const response = await axiosInstance.get("/api/analytics/user", {
      params: { days },
    })
    return response.data
  },
}

// Export API and individual modules
export const api = {
  ...authApi,
  ...blogApi,
  ...commentApi,
  ...uploadApi,
  ...analyticsApi,
}

export default axiosInstance

