# 🤖 NeuralChat (GC-2026-OPENSOFT)


A powerful, containerized **MERN Stack** AI Chat application capable of multi-model interactions. This project integrates **Google Gemini** and **Groq (Llama 3)** into a unified interface, supporting both text generation and vision capabilities, wrapped in a secure and responsive React frontend.

![NeuralChat Demo]([https://via.placeholder.com/800x400?text=NeuralChat+Interface+Preview](https://drive.google.com/file/d/1MFHhGZ4Ubga5x-CdD35nqpty00_BbwPt/view)) 
*(Add a screenshot of your app here)*

---

## 🚀 Features

* **Multi-Model Intelligence:** Seamlessly switch between **Google Gemini 1.5** and **Llama 3 (via Groq)**.
* **Vision Support:** Upload images for analysis using multimodal capabilities.
* **Secure Authentication:** User registration and login protected by **JWT** and secure cookies.
* **Persistent History:** All chats are stored in **MongoDB** for easy retrieval.
* **Markdown Rendering:** Rich text support for code blocks, tables, and lists.
* **Responsive UI:** Mobile-first design with a collapsible sidebar and Dark/Light theme toggle.
* **Containerized:** Fully Dockerized architecture (Frontend + Backend + Network) for easy deployment.

---

## 🛠️ Tech Stack

### **Frontend**
* **React** (Vite)
* **Tailwind CSS** (Styling)
* **Axios** (API Communication)
* **Context API** (State Management)

### **Backend**
* **Node.js & Express.js**
* **MongoDB & Mongoose** (Database)
* **JWT & Bcrypt** (Security)
* **Multer** (File Handling)

### **AI Providers**
* `@google/generative-ai`
* `groq-sdk`

---

## 📂 Project Structure

```bash
gc-2026-opensoft/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Auth & Chat logic
│   │   ├── middlewares/      # Auth checks, File uploads, Rate limiting
│   │   ├── models/           # Mongoose Schemas (User, Chat)
│   │   ├── providers/        # AI Wrappers (Gemini.js, Groq.js)
│   │   ├── routes/           # API Endpoints
│   │   ├── services/         # Business logic (aiService, databaseService)
│   │   └── index.js          # Server Entry Point
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # UI Components (MarkdownRenderer, etc.)
│   │   ├── hooks/            # Custom hooks (useChat)
│   │   ├── pages/            # Login, Signup, ChatInterface
│   │   ├── store/            # Context Providers (ThemeContext)
│   │   └── utils/            # API Configuration
│   ├── Dockerfile
│   └── vite.config.js
│
├── docker-compose.yml        # Orchestration Config
└── README.md

