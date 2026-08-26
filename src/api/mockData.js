export const mockClasses = [
  { id: 1, name: 'Class 9', code: 'C9' },
  { id: 2, name: 'Class 10', code: 'C10' },
  { id: 3, name: 'Class 8', code: 'C8' },
  { id: 4, name: 'Class 7', code: 'C7' },
]

export const mockSections = [
  { id: 1, name: 'Section A (Science)', class_id: 1, class_name: 'Class 9' },
  { id: 2, name: 'Section B (Commerce)', class_id: 1, class_name: 'Class 9' },
  { id: 3, name: 'Section A (Science)', class_id: 2, class_name: 'Class 10' },
  { id: 4, name: 'Section B (Arts)', class_id: 2, class_name: 'Class 10' },
]

export const mockSubjects = [
  { id: 1, name: 'Mathematics', code: 'MATH101', class_id: 1 },
  { id: 2, name: 'Physics', code: 'PHY101', class_id: 1 },
  { id: 3, name: 'Chemistry', code: 'CHEM101', class_id: 1 },
  { id: 4, name: 'English', code: 'ENG101', class_id: 1 },
  { id: 5, name: 'Bangla', code: 'BAN101', class_id: 1 },
]

export const mockStudents = [
  {
    id: 1,
    student_id: 'CMS-2026-001',
    full_name: 'Tanvir Ahmed',
    name_bangla: 'তানভীর আহমেদ',
    roll: '01',
    class_name: 1,
    class_title: 'Class 9',
    section: 1,
    section_name: 'Section A (Science)',
    gender: 'Male',
    dob: '2010-05-14',
    phone: '+8801711223344',
    email: 'tanvir.ahmed@student.edu.bd',
    blood_group: 'A+',
    religion: 'Islam',
    father_name: 'Rafiqul Ahmed',
    father_mobile: '+8801811223344',
    mother_name: 'Nasreen Begum',
    mother_mobile: '+8801911223344',
    present_address: 'House 12, Road 4, Sector 7, Uttara, Dhaka',
    permanent_address: 'Vill: Boroigram, Natore',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop',
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 2,
    student_id: 'CMS-2026-002',
    full_name: 'Sadia Jahan Mim',
    name_bangla: 'সাদিয়া জাহান মীম',
    roll: '02',
    class_name: 1,
    class_title: 'Class 9',
    section: 1,
    section_name: 'Section A (Science)',
    gender: 'Female',
    dob: '2010-08-22',
    phone: '+8801722334455',
    email: 'sadia.mim@student.edu.bd',
    blood_group: 'O+',
    religion: 'Islam',
    father_name: 'Jahangir Alam',
    father_mobile: '+8801822334455',
    mother_name: 'Salma Khatun',
    mother_mobile: '+8801922334455',
    present_address: 'Mirpur DOHS, Dhaka',
    permanent_address: 'Comilla Sadar, Comilla',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    created_at: '2026-01-11T10:00:00Z',
  },
  {
    id: 3,
    student_id: 'CMS-2026-003',
    full_name: 'Rahat Hossain',
    name_bangla: 'রাহাত হোসেন',
    roll: '03',
    class_name: 2,
    class_title: 'Class 10',
    section: 3,
    section_name: 'Section A (Science)',
    gender: 'Male',
    dob: '2009-11-03',
    phone: '+8801733445566',
    email: 'rahat.hossain@student.edu.bd',
    blood_group: 'B+',
    religion: 'Islam',
    father_name: 'Delwar Hossain',
    father_mobile: '+8801833445566',
    mother_name: 'Rehana Parvin',
    mother_mobile: '+8801933445566',
    present_address: 'Dhanmondi 27, Dhaka',
    permanent_address: 'Bogra Sadar, Bogra',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    created_at: '2026-01-12T10:00:00Z',
  },
  {
    id: 4,
    student_id: 'CMS-2026-004',
    full_name: 'Nusrat Farhana',
    name_bangla: 'নুসরাত ফারহানা',
    roll: '04',
    class_name: 2,
    class_title: 'Class 10',
    section: 3,
    section_name: 'Section A (Science)',
    gender: 'Female',
    dob: '2009-03-19',
    phone: '+8801744556677',
    email: 'nusrat.farhana@student.edu.bd',
    blood_group: 'AB+',
    religion: 'Islam',
    father_name: 'Farhan Chowdhury',
    father_mobile: '+8801844556677',
    mother_name: 'Tahmina Begum',
    mother_mobile: '+8801944556677',
    present_address: 'Gulshan 2, Dhaka',
    permanent_address: 'Sylhet Sadar, Sylhet',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop',
    created_at: '2026-01-15T10:00:00Z',
  }
]

export const mockTeachers = [
  {
    id: 1,
    teacher_id: 'CMS-TCH-001',
    full_name: 'Engr. Mohammad Lutfor Rahman',
    name_bangla: 'প্রকৌশলী মোহাম্মদ লুৎফর রহমান',
    email: 'lutforitsolution@gmail.com',
    phone: '+8801908987817',
    designation: 'Head of Computer Science & AI',
    qualification: 'B.Sc in CSE, AI Specialist',
    joining_date: '2022-01-01',
    salary: 65000,
    status: 'Active',
    gender: 'Male',
    photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
  },
  {
    id: 2,
    teacher_id: 'CMS-TCH-002',
    full_name: 'Dr. Shahinur Alam',
    name_bangla: 'ড. শাহিনুর আলম',
    email: 'shahinur.alam@school.edu.bd',
    phone: '+8801712345678',
    designation: 'Senior Mathematics Teacher',
    qualification: 'Ph.D in Applied Mathematics',
    joining_date: '2021-03-15',
    salary: 55000,
    status: 'Active',
    gender: 'Male',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
  },
  {
    id: 3,
    teacher_id: 'CMS-TCH-003',
    full_name: 'Fariha Yasmin',
    name_bangla: 'ফারিহা ইয়াসমিন',
    email: 'fariha.yasmin@school.edu.bd',
    phone: '+8801812345678',
    designation: 'Physics & Science Faculty',
    qualification: 'M.Sc in Physics (DU)',
    joining_date: '2023-06-01',
    salary: 48000,
    status: 'Active',
    gender: 'Female',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
  }
]

export const mockAttendance = {
  count: 48,
  results: [
    { status: 'present' }, { status: 'present' }, { status: 'present' }, { status: 'present' },
    { status: 'present' }, { status: 'present' }, { status: 'present' }, { status: 'present' },
    { status: 'absent' }, { status: 'absent' }, { status: 'late' }, { status: 'present' }
  ]
}

export const mockFees = {
  count: 3,
  results: [
    { id: 1, student_name: 'Tanvir Ahmed', student_id: 'CMS-2026-001', title: 'Monthly Tuition - August 2026', amount: 2500, status: 'paid', payment_method: 'bKash', date: '2026-08-10' },
    { id: 2, student_name: 'Sadia Jahan Mim', student_id: 'CMS-2026-002', title: 'Monthly Tuition - August 2026', amount: 2500, status: 'paid', payment_method: 'Nagad', date: '2026-08-12' },
    { id: 3, student_name: 'Rahat Hossain', student_id: 'CMS-2026-003', title: 'Exam Fee - 2nd Term', amount: 1200, status: 'due', payment_method: 'Pending', date: '2026-08-20' },
  ]
}

export const mockNotices = {
  count: 3,
  results: [
    {
      id: 1,
      title: '2nd Term Mid-Year Examination Schedule 2026',
      content: 'The 2nd Term Examinations will commence from September 10, 2026. All students are advised to collect their admit cards from the admin office.',
      target_role: 'all',
      created_at: '2026-08-24T09:00:00Z',
      author_name: 'Principal Office',
    },
    {
      id: 2,
      title: 'AI & Robotics Workshop for Class 9-10',
      content: 'Interactive AI workshop featuring generative models, prompt engineering, and Python programming on Saturday at 10:00 AM.',
      target_role: 'student',
      created_at: '2026-08-22T14:30:00Z',
      author_name: 'IT Department',
    },
    {
      id: 3,
      title: 'Teacher-Parent Meeting (PTM)',
      content: 'Parent-Teacher conference scheduled for this Friday to review Q2 student academic and attendance progress.',
      target_role: 'parent',
      created_at: '2026-08-20T11:15:00Z',
      author_name: 'Academic Coordinator',
    }
  ]
}

export const mockExams = {
  count: 2,
  results: [
    { id: 1, name: '2nd Term Mid-Year Exam 2026', class_id: 1, class_name: 'Class 9', start_date: '2026-09-10', end_date: '2026-09-22', is_published: true },
    { id: 2, name: 'Model Test Exam (SSC 2027)', class_id: 2, class_name: 'Class 10', start_date: '2026-10-05', end_date: '2026-10-18', is_published: false },
  ]
}

export const mockAccounting = {
  total_income: 345000,
  total_expense: 198000,
  net_profit: 147000,
  salary_expense: 168000,
  other_expense: 30000,
  monthly_data: [
    { month: 'May', income: 310000, expense: 180000 },
    { month: 'Jun', income: 325000, expense: 190000 },
    { month: 'Jul', income: 340000, expense: 195000 },
    { month: 'Aug', income: 345000, expense: 198000 },
  ]
}

export const mockTimetable = [
  { id: 1, day: 'Sunday', period: 1, time: '09:00 - 09:45 AM', subject: 'Mathematics', teacher: 'Dr. Shahinur Alam', room: 'Room 301' },
  { id: 2, day: 'Sunday', period: 2, time: '09:45 - 10:30 AM', subject: 'Physics', teacher: 'Fariha Yasmin', room: 'Lab 1' },
  { id: 3, day: 'Sunday', period: 3, time: '10:45 - 11:30 AM', subject: 'Computer & AI', teacher: 'Engr. Mohammad Lutfor Rahman', room: 'AI Lab' },
  { id: 4, day: 'Monday', period: 1, time: '09:00 - 09:45 AM', subject: 'English', teacher: 'Nusrat Jahan', room: 'Room 301' },
  { id: 5, day: 'Monday', period: 2, time: '09:45 - 10:30 AM', subject: 'Chemistry', teacher: 'Abdul Malek', room: 'Lab 2' },
]

export const mockAIResponses = {
  chat: 'Hello! I am your Cambrian School AI Assistant. I can help you analyze student performance, review attendance statistics, generate question papers, or organize lesson schedules. How may I assist you today?',
  lessonPlan: {
    title: 'Newton\'s Laws of Motion & Real-world Applications',
    subject: 'Physics',
    class: 'Class 9',
    duration: '45 Minutes',
    objectives: [
      'Understand the three laws of motion by Sir Isaac Newton',
      'Explain inertia, momentum, and action-reaction pairs',
      'Solve basic numerical problems using F = ma'
    ],
    sections: [
      { time: '0-10 min', title: 'Introduction & Hook', content: 'Real life demonstration with balloon rocket and skater' },
      { time: '10-25 min', title: 'Core Concept & Equations', content: 'Formulating F = ma and explaining unit vectors' },
      { time: '25-35 min', title: 'Interactive Group Activity', content: 'Calculating force required to accelerate a 500kg car' },
      { time: '35-45 min', title: 'Q&A and AI Quiz Evaluation', content: 'Rapid 3-question MCQ quiz on tablet/smartboard' }
    ]
  },
  schoolHealth: {
    score: 94,
    status: 'Excellent',
    summary: 'The school exhibits outstanding academic attendance (91%), robust financial surplus, and strong teacher-to-student engagement ratio.',
    recommendations: [
      'Organize extra booster sessions for Class 9 Physics before 2nd Term exams',
      'Automate remaining fee reminders via SMS/WhatsApp integration'
    ]
  }
}