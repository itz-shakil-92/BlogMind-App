import axios from "axios"

// Set the base API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL

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

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Auth-specific API functions
export const authApi = {
  // Register a new user
  register: async (userData: {
    email: string
    name: string
    password: string
    bio?: string
    avatar?: string
  }) => {
    const response = await apiClient.post("/api/auth/register", userData)
    return response.data
  },

  // Login with email and password
  login: async (email: string, password: string) => {
    const formData = new URLSearchParams()
    formData.append("username", email) // OAuth2 uses "username" for email
    formData.append("password", password)

    try {
      const response = await apiClient.post("/api/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })
      const data = response.data
      localStorage.setItem("token", data.access_token) // Store token
      return data
    } catch (error: any) {
      console.error("Login Failed:", error.response?.data || error.message)
      throw error
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get("/api/users/me")
      return response.data
    } catch (error: any) {
      console.error("Error fetching user:", error.response?.data || error.message)
      throw error
    }
  },

  // Update user profile
  updateUser: async (userData: {
    name?: string
    email?: string
    bio?: string
    avatar?: string
  }) => {
    try {
      const response = await apiClient.put("/api/users/me", userData)
      return response.data
    } catch (error: any) {
      console.error("Profile update failed:", error.response?.data || error.message)
      throw error
    }
  },
}

// Blog API functions
export const blogApi = {
  // Get all blogs with optional filtering
  getBlogs: async (params: {
    search?: string
    category?: string
    tag?: string
    sort?: string
    skip?: number
    limit?: number
  }) => {
    try {
      const response = await apiClient.get("/api/blogs", { params })
      return response.data
    } catch (error) {
      console.error("Failed to fetch blogs:", error)
      throw error
    }
  },

  // Get a blog by slug
  getBlogBySlug: async (slug: string) => {
    try {
      const response = await apiClient.get(`/api/blogs/${slug}`)
      return response.data
    } catch (error) {
      console.error("Failed to fetch blog:", error)
      throw error
    }
  },

  // Create a new blog
  createBlog: async (blogData: {
    title: string
    content: string
    excerpt: string
    category_id: string
    tags: string[]
    cover_image?: string
    published?: boolean
  }) => {
    try {
      



      const response = await apiClient.post("/api/blogs", blogData)
      return response.data
    } catch (error) {
      console.error("Failed to create blog:", error)
      throw error
    }
  },

  // Update a blog
  updateBlog: async (
    blogId: string,
    blogData: {
      title?: string
      content?: string
      excerpt?: string
      category_id?: string
      tags?: string[]
      cover_image?: string
      published?: boolean
    },
  ) => {
    try {
      const response = await apiClient.put(`/api/blogs/${blogId}`, blogData)
      return response.data
    } catch (error) {
      console.error("Failed to update blog:", error)
      throw error
    }
  },

  // Delete a blog
  deleteBlog: async (blogId: string) => {
    try {
      await apiClient.delete(`/api/blogs/${blogId}`)
      return true
    } catch (error) {
      console.error("Failed to delete blog:", error)
      throw error
    }
  },

  // Like or unlike a blog
  likeBlog: async (slug: string) => {
    try {
      const response = await apiClient.post(`/api/blogs/${slug}/like`)
      return response.data
    } catch (error) {
      console.error("Failed to like/unlike blog:", error)
      throw error
    }
  },

  // Get all categories
  getCategories: async () => {
    try {
      const response = await apiClient.get("/api/blogs/categories")
      //console.log("The categories are:", response.data) // Remove this line only for testing
      return response.data
    } catch (error) {
      console.error("Failed to fetch categories:", error)
      throw error
    }
  },

  // Get user's blogs
  getUserBlogs: async () => {
    try {
      const response = await apiClient.get("/api/users/blogs")
      return response.data
    } catch (error) {
      console.error("Failed to fetch user blogs:", error)
      throw error
    }
  },

  // Get user's liked blogs
  getLikedBlogs: async () => {
    try {
      const response = await apiClient.get("/api/users/liked")
      return response.data
    } catch (error) {
      console.error("Failed to fetch liked blogs:", error)
      throw error
    }
  },
}

// Comment API functions
export const commentApi = {
  // Get comments for a blog
  getComments: async (blogId: string) => {
    try {
      const response = await apiClient.get(`/api/comments/blog/${blogId}`)
      return response.data
    } catch (error) {
      console.error("Failed to fetch comments:", error)
      throw error
    }
  },

  // Add a comment to a blog
  addComment: async (blogId: string, content: string) => {
    try {
      const response = await apiClient.post("/api/comments", {
        blog_id: blogId,
        content,
      })
      return response.data
    } catch (error) {
      console.error("Failed to add comment:", error)
      throw error
    }
  },

  // Update a comment
  updateComment: async (commentId: string, content: string) => {
    try {
      const response = await apiClient.put(`/api/comments/${commentId}`, {
        content,
      })
      return response.data
    } catch (error) {
      console.error("Failed to update comment:", error)
      throw error
    }
  },

  // Delete a comment
  deleteComment: async (commentId: string) => {
    try {
      await apiClient.delete(`/api/comments/${commentId}`)
      return true
    } catch (error) {
      console.error("Failed to delete comment:", error)
      throw error
    }
  },

  // Get user's comments
  getUserComments: async () => {
    try {
      const response = await apiClient.get("/api/users/comments")
      return response.data
    } catch (error) {
      console.error("Failed to fetch user comments:", error)
      throw error
    }
  },
}

// Upload API functions
export const uploadApi = {
  // Upload avatar
  uploadAvatar: async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await apiClient.post("/api/uploads/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      console.error("Failed to upload avatar:", error)
      throw error
    }
  },

  // Upload blog image
  uploadBlogImage: async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await apiClient.post("/api/uploads/blog-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      console.error("Failed to upload blog image:", error)
      throw error
    }
  },
}

// Analytics API functions
export const analyticsApi = {
  // Record blog view
  recordBlogView: async (slug: string, referrer?: string) => {
    try {
      await apiClient.post(`/api/analytics/view/${slug}`, { referrer })
      return true
    } catch (error) {
      console.error("Failed to record view:", error)
      return false
    }
  },

  // Record read progress
  recordReadProgress: async (slug: string, readPercentage: number) => {
    if (!slug || typeof readPercentage !== "number" || readPercentage < 0 || readPercentage > 100) {
        console.error("Invalid read progress data");
        return false;
    }
    try {
        const response = await apiClient.post(`/api/analytics/read-progress/${slug}`, {
            read_percentage: readPercentage,
        });
        return response.data;
    } catch (error: any) {
        console.error("Failed to record read progress:", error.response?.data || error.message);
        return false;
    }
},

  // Get blog analytics
  getBlogAnalytics: async (slug: string, days = 30) => {
    try {
      const response = await apiClient.get(`/api/analytics/blog/${slug}`, {
        params: { days },
      })
      return response.data
    } catch (error) {
      console.error("Failed to fetch blog analytics:", error)
      throw error
    }
  },

  // Get user analytics
  getUserAnalytics: async (days = 30) => {
    try {
      const response = await apiClient.get("/api/analytics/user", {
        params: { days },
      })
      return response.data
    } catch (error) {
      console.error("Failed to fetch user analytics:", error)
      throw error
    }
  },
}

export const api = {
  likeBlog: blogApi.likeBlog,
  getUserAnalytics: analyticsApi.getUserAnalytics,
}

export default apiClient

