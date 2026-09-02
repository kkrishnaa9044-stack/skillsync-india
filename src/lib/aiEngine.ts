import type { SkillGap, JobRoleRequirement } from './types';

export interface JobRoleSkillSet {
  role: string;
  industry: string;
  requiredSkills: string[];
  currentCurriculum: string[];
}

const roleSkillMap: Record<string, string[]> = {
  'Data Analyst': ['Python', 'SQL', 'Excel', 'Power BI', 'Statistics', 'Tableau'],
  'Cybersecurity Analyst': ['Linux', 'Networking', 'SIEM', 'Cybersecurity', 'Cloud Security'],
  'Cloud Engineer': ['Cloud (AWS)', 'Docker', 'Kubernetes', 'Linux', 'Networking'],
  'Full Stack Developer': ['React', 'Node.js', 'Python', 'SQL', 'Docker'],
  'AI Engineer': ['Python', 'Machine Learning', 'Generative AI', 'Cloud (AWS)', 'Statistics'],
  'DevOps Engineer': ['Docker', 'Kubernetes', 'Cloud (AWS)', 'Linux', 'Networking'],
  'Data Scientist': ['Python', 'Machine Learning', 'SQL', 'Statistics', 'Generative AI'],
  'ML Engineer': ['Python', 'Machine Learning', 'Generative AI', 'Statistics', 'Cloud (AWS)'],
  'Power BI Developer': ['Power BI', 'SQL', 'Excel', 'Statistics', 'Python'],
  'Tableau Developer': ['Tableau', 'SQL', 'Excel', 'Statistics', 'Python'],
  'EV Engineer': ['EV Technology', 'Embedded Systems', 'Battery Management', 'Automotive Electronics'],
  'Battery Systems Engineer': ['Battery Management', 'EV Technology', 'Embedded Systems', 'Electrical Engineering'],
  'Automotive Electronics Engineer': ['Embedded Systems', 'Automotive Electronics', 'PLC Programming', 'CAD/CAM'],
  'Robotics Engineer': ['Robotics', 'PLC Programming', 'IoT', 'CAD/CAM', 'Automation'],
  'Automation Engineer': ['PLC Programming', 'IoT', 'Automation', 'CAD/CAM', 'Robotics'],
  'Automation Specialist': ['Automation', 'Robotics', 'PLC Programming', 'IoT'],
  'Financial Analyst': ['Financial Analysis', 'Excel', 'SQL', 'Python', 'Risk Management'],
  'Risk Analyst': ['Risk Management', 'Python', 'SQL', 'Statistics', 'Financial Analysis'],
  'Healthcare Data Analyst': ['Python', 'SQL', 'Statistics', 'Power BI', 'Medical Lab Tech'],
  'Medical Lab Technician': ['Medical Lab Tech', 'Nursing', 'Statistics'],
  'Solar Energy Engineer': ['Solar Technology', 'IoT', 'Electrical Engineering', 'CAD/CAM'],
  'Wind Energy Technician': ['Solar Technology', 'IoT', 'CAD/CAM'],
  'Supply Chain Analyst': ['Supply Chain Mgmt', 'Python', 'SQL', 'Data Analytics'],
  'Logistics Coordinator': ['Supply Chain Mgmt', 'Excel', 'Inventory Management'],
  'Retail Analyst': ['Python', 'SQL', 'Customer Analytics', 'Excel'],
  'BIM Engineer': ['BIM', 'CAD/CAM', 'Project Management'],
  'Project Manager': ['Project Management', 'BIM', 'Site Engineering'],
  'Network Engineer': ['Networking', 'Linux', 'Cloud (AWS)'],
  '5G Network Specialist': ['Networking', '5G', 'Cloud (AWS)', 'IoT'],
  'Cloud Architect': ['Cloud (AWS)', 'Kubernetes', 'Docker', 'Linux', 'Networking'],
  'Embedded Systems Engineer': ['Embedded Systems', 'IoT', 'PLC Programming', 'Linux'],
};

const industryDefaultCurriculum: Record<string, string[]> = {
  'IT & Software': ['Python', 'SQL', 'Excel', 'Basic Statistics'],
  'Manufacturing': ['PLC Programming', 'CAD/CAM', 'Basic Electronics', 'Safety'],
  'Healthcare': ['Anatomy', 'Medical Terminology', 'Basic Computers', 'Nursing'],
  'Automobile': ['Automotive Basics', 'Embedded Systems', 'Electrical Engineering', 'Safety'],
  'BFSI': ['Accounting', 'Excel', 'Financial Basics', 'Banking Operations'],
  'Retail': ['Customer Service', 'Excel', 'Sales Basics', 'Inventory Basics'],
  'Logistics': ['Supply Chain Basics', 'Excel', 'Inventory Management', 'Operations'],
  'Renewable Energy': ['Electrical Engineering', 'Solar Basics', 'Safety', 'IoT'],
  'Telecom': ['Networking', 'Telecom Basics', 'Linux', 'Safety'],
  'Construction': ['Civil Engineering', 'CAD/CAM', 'Safety', 'Project Basics'],
};

export function getRequiredSkills(role: string, industry: string): string[] {
  return roleSkillMap[role] || industryDefaultCurriculum[industry] || ['Python', 'SQL', 'Excel', 'Statistics'];
}

export function getCurrentCurriculum(program: string, industry: string): string[] {
  return industryDefaultCurriculum[industry] || ['Python', 'SQL', 'Excel', 'Statistics'];
}

export function getCurrentCurriculumForProgram(
  programName: string,
  trainingPrograms: { name: string; skills: string[] }[]
): string[] {
  const program = trainingPrograms.find((p) => p.name === programName);
  return program ? program.skills : ['Python', 'SQL', 'Excel', 'Statistics'];
}

export function computeSkillGaps(
  currentSkills: string[],
  requiredSkills: string[]
): SkillGap[] {
  const gaps: SkillGap[] = requiredSkills.map((skill) => {
    const has = currentSkills.includes(skill);
    const industryRequirement = 75 + Math.floor(Math.random() * 20);
    const trainingCoverage = has ? industryRequirement - Math.floor(Math.random() * 15) : Math.floor(Math.random() * 40);
    const gap = Math.max(0, industryRequirement - trainingCoverage);
    let status: SkillGap['status'] = 'Aligned';
    if (gap >= 35) status = 'Critical Gap';
    else if (gap >= 20) status = 'Partial Gap';
    return { skill, industryRequirement, trainingCoverage, gap, status };
  });
  return gaps.sort((a, b) => b.gap - a.gap);
}

export function computeAlignment(currentSkills: string[], requiredSkills: string[]): number {
  if (requiredSkills.length === 0) return 0;
  const matched = requiredSkills.filter((s) => currentSkills.includes(s)).length;
  return Math.round((matched / requiredSkills.length) * 100);
}

export function generateRecommendedModules(missingSkills: string[]): { title: string; description: string }[] {
  const moduleTemplates: Record<string, string> = {
    'Power BI': 'Advanced SQL & Power BI Data Visualization',
    'Tableau': 'Tableau Dashboard Design & Analytics',
    'Cloud (AWS)': 'Cloud Fundamentals & AWS Essentials',
    'Docker': 'Containerization with Docker',
    'Kubernetes': 'Orchestration with Kubernetes',
    'Generative AI': 'Generative AI & LLM Fundamentals',
    'Machine Learning': 'Machine Learning Algorithms & Practice',
    'Statistics': 'Advanced Statistics & Probability',
    'SQL': 'Advanced SQL & Database Design',
    'Python': 'Advanced Python Programming',
    'React': 'Modern Frontend with React',
    'Node.js': 'Backend Development with Node.js',
    'Linux': 'Linux System Administration',
    'Networking': 'Network Fundamentals & Security',
    'SIEM': 'SIEM & Security Operations',
    'Cybersecurity': 'Cybersecurity Operations & Defense',
    'Cloud Security': 'Cloud Security & Compliance',
    'EV Technology': 'EV Technology & Powertrain Systems',
    'Embedded Systems': 'Embedded Systems Design',
    'Battery Management': 'Battery Management Systems',
    'Automotive Electronics': 'Automotive Electronics & Diagnostics',
    'Robotics': 'Robotics & Industrial Automation',
    'PLC Programming': 'PLC Programming & Industrial Control',
    'IoT': 'IoT Systems & Edge Computing',
    'Automation': 'Industrial Automation & Control',
    'CAD/CAM': 'CAD/CAM & Digital Manufacturing',
    'Financial Analysis': 'Financial Analysis & Modeling',
    'Risk Management': 'Risk Management & Compliance',
    'Medical Lab Tech': 'Medical Laboratory Technology',
    'Nursing': 'Nursing & Patient Care',
    'Solar Technology': 'Solar Energy Systems & Installation',
    'Supply Chain Mgmt': 'Supply Chain Management & Logistics',
    '5G': '5G Network Architecture',
    'BIM': 'BIM & Digital Construction',
    'Project Management': 'Project Management & Planning',
  };

  return missingSkills.slice(0, 5).map((skill, i) => ({
    title: `Module ${i + 1} — ${moduleTemplates[skill] || skill}`,
    description: `Comprehensive training in ${skill} aligned with current industry requirements and practical projects.`,
  }));
}

export function computeExpectedImprovement(gaps: SkillGap[]): number {
  if (gaps.length === 0) return 0;
  const totalGap = gaps.reduce((sum, g) => sum + g.gap, 0);
  const avgGap = totalGap / gaps.length;
  return Math.min(35, Math.round(avgGap * 0.6));
}

export function generateAIInsight(gaps: SkillGap[], role: string, region: string): string {
  const critical = gaps.filter((g) => g.status === 'Critical Gap');
  const partial = gaps.filter((g) => g.status === 'Partial Gap');
  if (critical.length > 0) {
    return `${critical.map((g) => g.skill).join(' and ')} represent the highest skill gaps for ${role} roles in ${region}. Immediate curriculum updates recommended.`;
  }
  if (partial.length > 0) {
    return `${partial.map((g) => g.skill).join(' and ')} show moderate gaps for ${role} roles in ${region}. Consider supplementary training modules.`;
  }
  return `Training programs for ${role} roles in ${region} are well-aligned with industry requirements. Maintain current curriculum quality.`;
}

export function generateLearningPath(missingSkills: string[], careerInterest: string): string[] {
  const path: string[] = [];
  const baseOrder = ['SQL', 'Excel', 'Python', 'Statistics', 'Power BI', 'Tableau', 'Cloud (AWS)', 'Machine Learning', 'Generative AI'];
  for (const skill of baseOrder) {
    if (missingSkills.includes(skill)) path.push(skill);
  }
  for (const skill of missingSkills) {
    if (!path.includes(skill)) path.push(skill);
  }
  if (path.length === 0) path.push('Advanced ' + careerInterest);
  path.push('Industry Project');
  return path;
}
