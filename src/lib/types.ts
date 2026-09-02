export interface Job {
  id: string;
  company: string;
  role: string;
  location: string;
  state: string;
  district: string;
  industry: string;
  salaryMin: number;
  salaryMax: number;
  experienceMin: number;
  experienceMax: number;
  skills: string[];
  demand: "High" | "Medium" | "Low" | "Critical";
  postedDate: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  demand: number;
  growth: number;
  industry: string;
}

export interface Industry {
  id: string;
  name: string;
  demandScore: number;
  growth: number;
  topSkills: string[];
  criticalSkills: string[];
  avgSalaryMin: number;
  avgSalaryMax: number;
  jobCount: number;
  description: string;
}

export interface TrainingProgram {
  id: string;
  name: string;
  provider: string;
  state: string;
  skills: string[];
  duration: string;
  students: number;
  employmentRate: number;
  industryAlignment: number;
}

export interface StateData {
  id: string;
  name: string;
  districts: string[];
  jobDemand: number;
  topIndustries: string[];
  topSkills: string[];
  skillGap: number;
  trainingPrograms: number;
  employability: number;
}

export interface SkillGap {
  skill: string;
  industryRequirement: number;
  trainingCoverage: number;
  gap: number;
  status: "Aligned" | "Partial Gap" | "Critical Gap";
}

export interface StudentProfile {
  id: string;
  name: string;
  education: string;
  state: string;
  district: string;
  skills: string[];
  careerInterest: string;
  experience: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success";
  read: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface JobRoleRequirement {
  role: string;
  industry: string;
  requiredSkills: string[];
  currentCurriculum: string[];
}
