import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { authMiddleware, generateToken, sanitizeUser, AuthenticatedRequest } from './auth';
import { 
  DetailedSkill, LearningGoal, LearningActivitySession, ExpenseItem, 
  PlacementProject, StudentResume, ResumeATSAnalysis, InternshipOpportunity, 
  InterviewAttempt, InterviewPerformanceStats, PlacementReadinessData, 
  ProjectSubmission, HistoricalScore, SmartNotification, SkillMetric,
  RoadmapMilestone, CopilotMessage, WeeklyStudentReport
} from '../src/types';

export const apiRouter = Router();

// ==========================================
// Authentication Routes
// ==========================================

// Register
apiRouter.post('/auth/register', (req, res) => {
  const { name, email, password, confirmPassword, department, year } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Full student name is required.' });
  }

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  if (!department || !year) {
    return res.status(400).json({ error: 'Department and academic year are required.' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email address already exists. Please sign in.' });
  }

  const { user, studentData } = db.createUser({
    name,
    email,
    password,
    department,
    year,
  });

  const token = generateToken(user);

  return res.status(201).json({
    token,
    user: sanitizeUser(user),
    isNewUser: true,
    studentData,
  });
});

// Login
apiRouter.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = generateToken(user);
  const studentData = db.getStudentData(user.id);

  return res.json({
    token,
    user: sanitizeUser(user),
    isNewUser: !user.interest,
    studentData,
  });
});

// Forgot / Reset Password
apiRouter.post('/auth/forgot-password', (req, res) => {
  const { email, newPassword, confirmNewPassword } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required.' });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'No account registered with this email address.' });
  }

  const passwordHash = bcrypt.hashSync(newPassword, 10);
  db.updateUser(user.id, { passwordHash });

  return res.json({
    message: 'Password reset successfully. You can now sign in with your new password.',
  });
});

// Get Current User Profile
apiRouter.get('/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  return res.json({
    user: sanitizeUser(req.user!),
  });
});

// Logout
apiRouter.post('/auth/logout', (_req, res) => {
  return res.json({ message: 'Logged out successfully.' });
});

// ==========================================
// Student Data & Persistence Routes
// ==========================================

// Get All Student Data (Single Source of Truth)
apiRouter.get('/student/data', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const data = db.getStudentData(userId);

  if (!data) {
    return res.status(404).json({ error: 'Student records not found.' });
  }

  return res.json({
    user: sanitizeUser(req.user!),
    studentData: data,
  });
});

// Update Onboarding Interest & Target Role
apiRouter.put('/student/onboarding', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { interest, targetRole } = req.body;

  if (!interest) {
    return res.status(400).json({ error: 'Interest / specialization is required.' });
  }

  const updatedUser = db.updateUser(userId, {
    interest,
    targetRole: targetRole || req.user!.targetRole || 'Software Engineer',
  });

  const studentData = db.getStudentData(userId);
  if (studentData) {
    studentData.careerAlignment.targetRole = targetRole || req.user!.targetRole || 'Software Engineer';
    studentData.studentResume.targetRole = targetRole || req.user!.targetRole || 'Software Engineer';
    db.updateStudentData(userId, studentData);
  }

  return res.json({
    user: sanitizeUser(updatedUser!),
    studentData,
  });
});

// Update Profile
apiRouter.put('/student/profile', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { name, department, year, interest, targetRole } = req.body;

  const updatedUser = db.updateUser(userId, {
    ...(name ? { name: name.trim() } : {}),
    ...(department ? { department } : {}),
    ...(year ? { year } : {}),
    ...(interest ? { interest } : {}),
    ...(targetRole ? { targetRole } : {}),
  });

  return res.json({
    user: sanitizeUser(updatedUser!),
  });
});

// Skills CRUD
apiRouter.post('/student/skills', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { skill } = req.body as { skill: DetailedSkill };

  if (!skill || !skill.name) {
    return res.status(400).json({ error: 'Skill details are required.' });
  }

  const data = db.getStudentData(userId);
  if (!data) return res.status(404).json({ error: 'User data not found.' });

  const existingIdx = data.detailedSkills.findIndex((s) => s.id === skill.id || s.name.toLowerCase() === skill.name.toLowerCase());
  if (existingIdx >= 0) {
    data.detailedSkills[existingIdx] = { ...data.detailedSkills[existingIdx], ...skill };
  } else {
    data.detailedSkills.unshift(skill);
  }

  db.updateStudentData(userId, { detailedSkills: data.detailedSkills });
  return res.json({ detailedSkills: data.detailedSkills });
});

apiRouter.delete('/student/skills/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const data = db.getStudentData(userId);
  if (!data) return res.status(404).json({ error: 'User data not found.' });

  data.detailedSkills = data.detailedSkills.filter((s) => s.id !== id);
  db.updateStudentData(userId, { detailedSkills: data.detailedSkills });

  return res.json({ detailedSkills: data.detailedSkills });
});

// Learning Goals CRUD
apiRouter.post('/student/goals', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { goal } = req.body as { goal: LearningGoal };

  if (!goal || !goal.title) {
    return res.status(400).json({ error: 'Goal data is required.' });
  }

  const data = db.getStudentData(userId);
  if (!data) return res.status(404).json({ error: 'User data not found.' });

  const existingIdx = data.learningGoals.findIndex((g) => g.id === goal.id);
  if (existingIdx >= 0) {
    data.learningGoals[existingIdx] = { ...data.learningGoals[existingIdx], ...goal };
  } else {
    data.learningGoals.unshift(goal);
  }

  db.updateStudentData(userId, { learningGoals: data.learningGoals });
  return res.json({ learningGoals: data.learningGoals });
});

apiRouter.delete('/student/goals/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const data = db.getStudentData(userId);
  if (!data) return res.status(404).json({ error: 'User data not found.' });

  data.learningGoals = data.learningGoals.filter((g) => g.id !== id);
  db.updateStudentData(userId, { learningGoals: data.learningGoals });

  return res.json({ learningGoals: data.learningGoals });
});

// Learning Activity Sessions & Streak
apiRouter.post('/student/activity', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { minutes, topicsCovered, skillName } = req.body;

  if (!minutes || !skillName) {
    return res.status(400).json({ error: 'Session minutes and skillName are required.' });
  }

  const data = db.getStudentData(userId);
  if (!data) return res.status(404).json({ error: 'User data not found.' });

  const today = new Date().toISOString().split('T')[0];
  const newSession: LearningActivitySession = {
    id: `act-${Date.now()}`,
    date: today,
    minutes: Number(minutes),
    topicsCovered: topicsCovered || `Practice on ${skillName}`,
    skillName,
  };

  data.activitySessions.unshift(newSession);

  // Update streak
  const isConsecutive = data.streakData.lastActiveDate !== today;
  const newStreak = isConsecutive ? data.streakData.currentStreak + 1 : data.streakData.currentStreak;
  data.streakData.currentStreak = newStreak;
  data.streakData.longestStreak = Math.max(data.streakData.longestStreak, newStreak);
  data.streakData.totalDays = isConsecutive ? data.streakData.totalDays + 1 : data.streakData.totalDays;
  data.streakData.totalHours = Math.round((data.streakData.totalHours + Number(minutes) / 60) * 10) / 10;
  data.streakData.lastActiveDate = today;

  // Update skill progress
  const targetSkill = data.detailedSkills.find((s) => s.name.toLowerCase() === skillName.toLowerCase());
  if (targetSkill) {
    targetSkill.hoursSpent = Math.round((targetSkill.hoursSpent + Number(minutes) / 60) * 10) / 10;
    targetSkill.progress = Math.min(100, targetSkill.progress + 2);
    targetSkill.lastPracticed = today;
  }

  db.updateStudentData(userId, {
    activitySessions: data.activitySessions,
    streakData: data.streakData,
    detailedSkills: data.detailedSkills,
  });

  return res.json({
    activitySessions: data.activitySessions,
    streakData: data.streakData,
    detailedSkills: data.detailedSkills,
  });
});

// Roadmap Topic Toggle
apiRouter.put('/student/roadmap/topic', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { milestoneId, topicId } = req.body;

  const data = db.getStudentData(userId);
  if (!data) return res.status(404).json({ error: 'User data not found.' });

  data.learningRoadmap = data.learningRoadmap.map((m) => {
    if (m.id !== milestoneId) return m;
    const newTopics = m.topics.map((t) => (t.id === topicId ? { ...t, completed: !t.completed } : t));
    const done = newTopics.filter((t) => t.completed).length;
    const newProgress = newTopics.length > 0 ? Math.round((done / newTopics.length) * 100) : 0;
    const newStatus = newProgress === 100 ? 'Completed' : newProgress > 0 ? 'In Progress' : 'Planned';
    return {
      ...m,
      topics: newTopics,
      progress: newProgress,
      status: newStatus as any,
    };
  });

  db.updateStudentData(userId, { learningRoadmap: data.learningRoadmap });
  return res.json({ learningRoadmap: data.learningRoadmap });
});

// Expenses CRUD & Budget
apiRouter.post('/student/expenses', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { expense } = req.body as { expense: ExpenseItem };

  if (!expense || !expense.title || !expense.amount) {
    return res.status(400).json({ error: 'Expense title and amount are required.' });
  }

  const data = db.getStudentData(userId);
  if (!data) return res.status(404).json({ error: 'User data not found.' });

  data.expenses.unshift(expense);
  db.updateStudentData(userId, { expenses: data.expenses });

  return res.json({ expenses: data.expenses });
});

apiRouter.delete('/student/expenses/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const data = db.getStudentData(userId);
  if (!data) return res.status(404).json({ error: 'User data not found.' });

  data.expenses = data.expenses.filter((e) => e.id !== id);
  db.updateStudentData(userId, { expenses: data.expenses });

  return res.json({ expenses: data.expenses });
});

apiRouter.put('/student/budget', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { monthlyBudget } = req.body;

  if (!monthlyBudget || monthlyBudget < 0) {
    return res.status(400).json({ error: 'Valid monthly budget is required.' });
  }

  const data = db.getStudentData(userId);
  if (!data) return res.status(404).json({ error: 'User data not found.' });

  data.monthlyBudget = Number(monthlyBudget);
  db.updateStudentData(userId, { monthlyBudget: data.monthlyBudget });

  return res.json({ monthlyBudget: data.monthlyBudget });
});

// Evaluated Projects & Submissions
apiRouter.post('/student/projects/save-eval', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { submission } = req.body as { submission: ProjectSubmission };

  if (!submission || !submission.title) {
    return res.status(400).json({ error: 'Submission details are required.' });
  }

  const data = db.getStudentData(userId);
  if (!data) return res.status(404).json({ error: 'User data not found.' });

  data.submissions.unshift(submission);

  if (submission.evaluation) {
    const newScore: HistoricalScore = {
      date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      projectTitle: submission.title,
      score: submission.evaluation.overallScore,
      technicalComplexity: submission.evaluation.scoreBreakdown.technicalComplexity,
      industryRelevance: submission.evaluation.scoreBreakdown.industryRelevance,
      codeArchitectureQuality: submission.evaluation.scoreBreakdown.codeArchitectureQuality,
      innovationAndImpact: submission.evaluation.scoreBreakdown.innovationAndImpact,
    };
    data.historicalScores.push(newScore);
  }

  db.updateStudentData(userId, {
    submissions: data.submissions,
    historicalScores: data.historicalScores,
  });

  return res.json({
    submissions: data.submissions,
    historicalScores: data.historicalScores,
  });
});

// Placement Projects Update
apiRouter.put('/student/placement-projects', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { placementProjects } = req.body;

  const data = db.getStudentData(userId);
  if (!data) return res.status(404).json({ error: 'User data not found.' });

  data.placementProjects = placementProjects;
  db.updateStudentData(userId, { placementProjects });

  return res.json({ placementProjects });
});

// Resume Update
apiRouter.put('/student/resume', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { studentResume, resumeAnalysis } = req.body;

  const data = db.getStudentData(userId);
  if (!data) return res.status(404).json({ error: 'User data not found.' });

  if (studentResume) data.studentResume = studentResume;
  if (resumeAnalysis) data.resumeAnalysis = resumeAnalysis;

  db.updateStudentData(userId, {
    studentResume: data.studentResume,
    resumeAnalysis: data.resumeAnalysis,
  });

  return res.json({
    studentResume: data.studentResume,
    resumeAnalysis: data.resumeAnalysis,
  });
});

// Internships Update
apiRouter.put('/student/internships', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { internships } = req.body;

  const data = db.getStudentData(userId);
  if (!data) return res.status(404).json({ error: 'User data not found.' });

  data.internships = internships;
  db.updateStudentData(userId, { internships });

  return res.json({ internships });
});

// Interview Attempt
apiRouter.post('/student/interviews/attempt', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { attempt } = req.body as { attempt: InterviewAttempt };

  if (!attempt) {
    return res.status(400).json({ error: 'Attempt data is required.' });
  }

  const data = db.getStudentData(userId);
  if (!data) return res.status(404).json({ error: 'User data not found.' });

  data.interviewAttempts.unshift(attempt);

  const attempts = data.interviewAttempts;
  const avg = Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length);
  const techAttempts = attempts.filter((a) => a.category === 'Technical');
  const hrAttempts = attempts.filter((a) => a.category === 'HR/Communication');
  const aptAttempts = attempts.filter((a) => a.category === 'Aptitude');

  data.interviewStats = {
    totalAttempts: attempts.length,
    averageScore: avg,
    technicalScore: techAttempts.length > 0 ? Math.round(techAttempts.reduce((s, a) => s + a.score, 0) / techAttempts.length) : 80,
    hrScore: hrAttempts.length > 0 ? Math.round(hrAttempts.reduce((s, a) => s + a.score, 0) / hrAttempts.length) : 80,
    aptitudeScore: aptAttempts.length > 0 ? Math.round(aptAttempts.reduce((s, a) => s + a.score, 0) / aptAttempts.length) : 80,
    accuracy: avg,
    topicMastery: [
      { topic: 'Core Technical Concepts', attempts: techAttempts.length, avgScore: techAttempts.length > 0 ? Math.round(techAttempts.reduce((s, a) => s + a.score, 0) / techAttempts.length) : 80 },
      { topic: 'Behavioral & Leadership', attempts: hrAttempts.length, avgScore: hrAttempts.length > 0 ? Math.round(hrAttempts.reduce((s, a) => s + a.score, 0) / hrAttempts.length) : 80 },
    ],
  };

  db.updateStudentData(userId, {
    interviewAttempts: data.interviewAttempts,
    interviewStats: data.interviewStats,
  });

  return res.json({
    interviewAttempts: data.interviewAttempts,
    interviewStats: data.interviewStats,
  });
});

// Placement Readiness Update
apiRouter.put('/student/placement-readiness', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { placementReadiness } = req.body;

  const data = db.getStudentData(userId);
  if (!data) return res.status(404).json({ error: 'User data not found.' });

  data.placementReadiness = placementReadiness;
  db.updateStudentData(userId, { placementReadiness });

  return res.json({ placementReadiness });
});

// Notifications Read Status
apiRouter.put('/student/notifications', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { notificationId, markAllRead } = req.body;

  const data = db.getStudentData(userId);
  if (!data) return res.status(404).json({ error: 'User data not found.' });

  if (markAllRead) {
    data.notifications = data.notifications.map((n) => ({ ...n, read: true }));
  } else if (notificationId) {
    data.notifications = data.notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
  }

  db.updateStudentData(userId, { notifications: data.notifications });
  return res.json({ notifications: data.notifications });
});

// Basic Skills CRUD (Phase 1 / Data Entry Modal)
apiRouter.post('/student/basic-skills', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { skill } = req.body as { skill: SkillMetric };

  if (!skill || !skill.name) {
    return res.status(400).json({ error: 'Skill metric details are required.' });
  }

  const data = db.getStudentData(userId);
  if (!data) return res.status(404).json({ error: 'User data not found.' });

  const existingIdx = data.skills.findIndex((s) => s.name.toLowerCase() === skill.name.toLowerCase());
  if (existingIdx >= 0) {
    data.skills[existingIdx] = { ...data.skills[existingIdx], ...skill };
  } else {
    data.skills.unshift(skill);
  }

  db.updateStudentData(userId, { skills: data.skills });
  return res.json({ skills: data.skills });
});

// Historical Scores (Phase 1 / Data Entry Modal)
apiRouter.post('/student/historical-scores', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { score } = req.body as { score: HistoricalScore };

  if (!score || !score.projectTitle) {
    return res.status(400).json({ error: 'Historical score details are required.' });
  }

  const data = db.getStudentData(userId);
  if (!data) return res.status(404).json({ error: 'User data not found.' });

  data.historicalScores.push(score);
  db.updateStudentData(userId, { historicalScores: data.historicalScores });

  return res.json({ historicalScores: data.historicalScores });
});

// Career Roadmap Milestones & Tasks (Phase 1)
apiRouter.put('/student/career-roadmap', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { milestones, milestoneId, taskId } = req.body;

  const data = db.getStudentData(userId);
  if (!data) return res.status(404).json({ error: 'User data not found.' });

  if (Array.isArray(milestones)) {
    data.roadmapMilestones = milestones;
  } else if (milestoneId && taskId) {
    data.roadmapMilestones = data.roadmapMilestones.map((m) => {
      if (m.id !== milestoneId) return m;
      return {
        ...m,
        tasks: m.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
      };
    });
  }

  db.updateStudentData(userId, { roadmapMilestones: data.roadmapMilestones });
  return res.json({ roadmapMilestones: data.roadmapMilestones });
});

// Copilot Chat History Persistence (Phase 5)
apiRouter.get('/student/copilot-history', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const data = db.getStudentData(userId);
  if (!data) return res.status(404).json({ error: 'User data not found.' });

  return res.json({ copilotChatHistory: data.copilotChatHistory || [] });
});

apiRouter.post('/student/copilot-history', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { message } = req.body as { message: CopilotMessage };

  if (!message || !message.text) {
    return res.status(400).json({ error: 'Copilot message is required.' });
  }

  const data = db.getStudentData(userId);
  if (!data) return res.status(404).json({ error: 'User data not found.' });

  if (!data.copilotChatHistory) data.copilotChatHistory = [];
  data.copilotChatHistory.push(message);

  db.updateStudentData(userId, { copilotChatHistory: data.copilotChatHistory });
  return res.json({ copilotChatHistory: data.copilotChatHistory });
});

apiRouter.delete('/student/copilot-history', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const data = db.getStudentData(userId);
  if (!data) return res.status(404).json({ error: 'User data not found.' });

  data.copilotChatHistory = [];
  db.updateStudentData(userId, { copilotChatHistory: [] });
  return res.json({ copilotChatHistory: [] });
});

// Weekly Reports Persistence (Phase 5)
apiRouter.get('/student/reports', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const data = db.getStudentData(userId);
  if (!data) return res.status(404).json({ error: 'User data not found.' });

  return res.json({ weeklyReports: data.weeklyReports || [] });
});

apiRouter.post('/student/reports', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { report } = req.body as { report: WeeklyStudentReport };

  if (!report || !report.id) {
    return res.status(400).json({ error: 'Weekly report is required.' });
  }

  const data = db.getStudentData(userId);
  if (!data) return res.status(404).json({ error: 'User data not found.' });

  if (!data.weeklyReports) data.weeklyReports = [];
  data.weeklyReports.unshift(report);

  db.updateStudentData(userId, { weeklyReports: data.weeklyReports });
  return res.json({ weeklyReports: data.weeklyReports });
});
