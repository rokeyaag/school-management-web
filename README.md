# School Management AI — Web Frontend

A modern, AI-powered school management SaaS frontend built with React. Provides a comprehensive dashboard for managing students, teachers, attendance, exams, fees, accounting, and more — with integrated AI features powered by Groq for intelligent insights, report generation, and a conversational school assistant.

## Features

### Core Management
- **Dashboard** — Real-time overview with stat cards, attendance charts, recent notices, and AI insights
- **Student Management** — CRUD operations, multi-step enrollment form, photo upload (Cloudinary), bulk CSV import, PDF export, and ID card generation
- **Teacher Management** — Full teacher profiles, qualification tracking, photo upload, and printable profiles
- **Attendance** — Daily attendance marking with present/absent/late/excused statuses and visual summaries
- **Exam Management** — Create exams, enter marks per student/subject, publish results, and generate AI report cards
- **Fee & Payments** — Payment tracking with multiple methods (bKash, Nagad, Rocket, bank, card), student self-pay portal, category management, and status reports
- **Notice Board** — Create and broadcast notices by role with AI-assisted content generation
- **Class Timetable** — Visual weekly schedule builder with day/period management per class section
- **Photo Gallery** — Album-based photo management with lightbox viewer and admin upload
- **Parent Portal** — Read-only dashboard for parents showing child's attendance, marks, fees, and notices

### AI Features (Groq-Powered)
- **AI Insights** — Student performance analysis with subject breakdowns, weak/strong areas, and natural language reports
- **School AI Chatbot** — Floating conversational assistant for querying school data (supports English and Bangla)
- **Lesson Plan Generator** — AI-generated lesson plans by subject, topic, class, and duration
- **Study Recommendations** — Personalized study plans per student based on performance data
- **Question Generator** — Auto-generate MCQ and short questions by subject, topic, and difficulty
- **Attendance Predictor** — Identify at-risk students based on attendance patterns
- **Fee Defaulter Analysis** — Predict potential fee defaulters with risk scoring
- **Parent Progress Reports** — AI-generated detailed reports for parent communication
- **AI Financial Reports** — Financial health analysis, expense optimization, and salary cost insights
- **Textbook AI (RAG)** — Upload textbooks (text, PDF, scanned images), ask questions with vector-search-powered answers via ChromaDB

### System & Admin
- **Settings** — Profile management, password change, school branding (logo, info), and avatar upload
- **Admin Panel** — Super admin school approval/rejection workflow for multi-tenant SaaS
- **Multi-tenant Architecture** — Each school operates in its own isolated data space
- **Role-Based Access** — Different views for `super_admin`, `school_admin`, `teacher`, `student`, and `parent`
- **Voice Input** — Speech-to-text for chatbot and Textbook AI queries (Web Speech API)
- **Bilingual Support** — English and Bangla across AI features

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Routing | React Router 7 |
| HTTP Client | Axios (with JWT interceptor & token refresh) |
| State | React hooks (`useState`, `useEffect`, `useContext`) |
| Styling | Tailwind CSS 3 |
| Charts | Recharts (Bar, Pie) |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Image Upload | Cloudinary |
| Backend API | Django REST Framework (separate repo) |
| AI Engine | Groq API (via backend) |
| Vector Search | ChromaDB (via backend) |

## Getting Started

### Prerequisites

- Node.js 18+
- The [school-management-backend](../school-management-backend) Django server running on `http://127.0.0.1:8000`

### Installation

```bash
# Clone the repository
git clone https://github.com/rokeyaag/school-management-web.git
cd school-management-web

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

### API Configuration

The backend API base URL is configured in `src/api/axiosConfig.js`:

```js
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
})
```

Update this to match your backend deployment URL for production.

## Project Structure

```
src/
├── api/
│   └── axiosConfig.js            # Axios instance with JWT auth & token refresh
├── context/
│   └── AuthContext.jsx           # Authentication context (login, logout, user state)
├── components/
│   ├── common/
│   │   ├── Sidebar.jsx           # Collapsible grouped navigation sidebar
│   │   ├── FloatingChatbot.jsx   # Floating AI school assistant with voice input
│   │   ├── FloatingTextbookAI.jsx # Floating textbook Q&A widget
│   │   └── BackButton.jsx        # Reusable back navigation button
│   └── students/
│       └── StudentBulkUpload.jsx # CSV bulk import with drag-and-drop
├── pages/
│   ├── auth/
│   │   └── Login.jsx             # Login, registration, forgot password
│   ├── dashboard/
│   │   └── Dashboard.jsx         # Main dashboard with stats & charts
│   ├── students/
│   │   ├── Students.jsx          # Student list with search, add, export
│   │   ├── StudentDetail.jsx     # Student profile with inline editing
│   │   └── StudentPrint.jsx      # Printable student information card
│   ├── teachers/
│   │   ├── Teachers.jsx          # Teacher list with multi-step add form
│   │   ├── TeacherDetail.jsx     # Teacher profile with photo upload
│   │   └── TeacherPrint.jsx      # Printable teacher profile
│   ├── attendance/
│   │   └── Attendance.jsx        # Daily attendance marking interface
│   ├── exams/
│   │   ├── Exams.jsx             # Exam list with create modal
│   │   └── ExamDetail.jsx        # Mark entry, results view, AI report card
│   ├── fees/
│   │   └── Fees.jsx              # Payments, categories, student pay portal
│   ├── notices/
│   │   └── Notices.jsx           # Notice board with AI content generation
│   ├── accounting/
│   │   ├── Accounting.jsx        # Income/expense tracking with summary
│   │   ├── SalaryManagement.jsx  # Teacher salary payments by month
│   │   └── AIFinancialReports.jsx # AI-generated financial analysis
│   ├── timetable/
│   │   └── Timetable.jsx         # Weekly class schedule builder
│   ├── parent/
│   │   └── ParentPortal.jsx      # Parent view of child's school data
│   ├── ai/
│   │   ├── AIInsights.jsx        # Student performance analysis & chatbot
│   │   ├── QuestionGenerator.jsx # AI exam question generator
│   │   ├── AttendancePredictor.jsx # At-risk student prediction
│   │   ├── FeeDefaulter.jsx      # Fee defaulter risk analysis
│   │   └── ParentReport.jsx      # AI parent progress reports
│   ├── knowledge/
│   │   └── TextbookAI.jsx        # RAG-based textbook Q&A with PDF/image upload
│   ├── lesson/
│   │   └── LessonPlan.jsx        # AI lesson plan generator
│   ├── study/
│   │   └── StudyRecommendation.jsx # AI study plan recommendations
│   ├── health/
│   │   └── SchoolHealth.jsx      # School-wide health dashboard & AI report
│   ├── admin/
│   │   └── AdminPanel.jsx        # Super admin school management
│   ├── settings/
│   │   └── Settings.jsx          # Profile, password, school settings
│   └── Gallery.jsx               # Photo album management
├── App.jsx                       # Route definitions & layout
├── main.jsx                      # App entry point
└── index.css                     # Tailwind base styles
```

## Authentication

The app uses JWT-based authentication with automatic token refresh:

1. Login sends credentials to `/api/auth/login/` and stores access/refresh tokens in `localStorage`
2. All API requests include `Authorization: Bearer <token>` via an Axios interceptor
3. On 401 responses, the interceptor automatically refreshes the token via `/api/auth/token/refresh/`
4. If refresh fails, the user is redirected to the login page

## Roles & Permissions

| Role | Access |
|------|--------|
| `super_admin` | Full access including Admin Panel and School Health |
| `school_admin` | All school features except super admin panel |
| `teacher` | Dashboard, attendance, exams, AI tools, notices |
| `student` | Dashboard, fee payments, exam results, notices |
| `parent` | Parent Portal with child's attendance, marks, and fees |

## License

This project is proprietary software developed for Cambrian Model School.
