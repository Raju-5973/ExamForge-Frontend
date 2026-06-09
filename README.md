# Question Paper Generator System

A modern, professional web application for managing questions and generating customized question papers with role-based access control.

## Features

### 🔐 Authentication System
- **Login & Registration**: Secure email/password authentication
- **Role-Based Access**: Separate interfaces for Staff and Principal users
- **Persistent Sessions**: Token-based authentication with secure session management

### 👥 Role-Based Dashboards

#### Staff Dashboard
- Add new questions to the question bank
- Edit and delete existing questions
- Manage questions with the following fields:
  - Question text
  - Subject (Mathematics, Physics, Chemistry, Biology, English, Computer Science, Electronics, Electrical, Mechanical, Civil)
  - Difficulty level (Easy, Medium, Hard)
  - Marks
- View all questions in an organized table format
- Real-time statistics

#### Principal Dashboard
- View question bank statistics by subject
- Generate custom question papers with:
  - Subject selection
  - Flexible marks distribution (e.g., 5 questions of 2 marks, 3 questions of 5 marks)
  - Automatic question selection from the database
- Intelligent question allocation based on marks

### 📄 Question Paper Generation
- **Professional Format**: Section-wise display (Section A, Section B, etc.)
- **Clear Numbering**: Sequential question numbering with marks indicated
- **Download as PDF**: Generate high-quality PDF documents
- **Print Support**: Optimized print layout
- **Automatic Sections**: Questions grouped by marks value

### 🎨 Modern UI/UX
- **Clean Design**: Minimal, professional interface with card-based layouts
- **Dark Mode**: Toggle between light and dark themes
- **Responsive**: Works seamlessly on desktop and mobile devices
- **Smooth Animations**: Polished transitions and loading states
- **Color-Coded**: Visual indicators for difficulty levels and marks
- **Intuitive Navigation**: Clear separation of sections and features

### 🛠️ Technical Features
- Built with React 19 + TypeScript
- Tailwind CSS for styling
- React Router for navigation
- jsPDF for PDF generation
- Django REST Framework for backend API
- SQLite/PostgreSQL for database persistence
- Context API for state management
- Lucide React for icons

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd examforge_backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run migrations:
   ```bash
   python manage.py migrate
   ```
4. Start Django server:
   ```bash
   python manage.py runserver
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Usage Guide

### For Staff Users

1. **Register/Login**:
   - Create an account with role "Staff"
   - Or login with existing credentials

2. **Add Questions**:
   - Fill in the question form with all required fields
   - Select subject, difficulty, and marks
   - Click "Add Question" to save

3. **Manage Questions**:
   - View all your questions in the question bank
   - Edit any question by clicking the edit icon
   - Delete questions you no longer need

### For Principal Users

1. **Register/Login**:
   - Create an account with role "Principal"
   - Or login with existing credentials

2. **View Statistics**:
   - See the number of available questions per subject
   - Monitor the question bank growth

3. **Generate Question Paper**:
   - Select the subject
   - Define marks distribution (add multiple rows for different mark values)
   - Click "Generate Question Paper"
   - Download as PDF or print directly

### Example Workflow

**Staff adds questions:**
```
Question: "What is the capital of France?"
Subject: Geography
Difficulty: Easy
Marks: 2
```

**Principal generates paper:**
```
Subject: Geography
Distribution:
  - 2 marks: 5 questions
  - 5 marks: 3 questions
Total: 25 marks
```

## Data Storage

The application uses a Django REST Framework backend for robust data management:
- **Relational Database**: Questions, users, and papers are stored in a structured database.
- **Data Isolation**: Department-level restriction for staff members.
- **Secure Auth**: Token-based authentication for all protected endpoints.

## Theme Support

Toggle between light and dark modes using the theme button in the header. Your preference is saved automatically.

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Tips

1. **For Better PDFs**: Use Chrome browser for the best PDF generation results
2. **Adding Questions**: Add diverse questions with various marks to give principals flexibility
3. **Marks Distribution**: You can create complex papers by adding multiple rows with different mark values
4. **Dark Mode**: Use dark mode for comfortable late-night work sessions

## Security Note

This is a demonstration application using client-side storage. For production use:
- Implement a proper backend API
- Use secure authentication (JWT, OAuth)
- Store data in a database
- Add proper encryption for sensitive data
- Implement role-based access control on the server

## Future Enhancements

Potential features for future versions:
- Question categories and tags
- Image support in questions
- Multiple choice questions with options
- Answer key generation
- Question paper templates
- Bulk question import/export
- Question review and approval workflow
- Analytics and reporting
- Multi-language support

## License

This project is created for educational purposes.

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
