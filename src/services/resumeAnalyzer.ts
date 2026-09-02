import { skills as allSkills, jobs as allJobs, trainingPrograms } from '@/lib/demoData';
import { getRequiredSkills, computeSkillGaps, generateLearningPath, generateRecommendedModules } from '@/lib/aiEngine';

export interface ResumeAnalysis {
  resumeScore: number;
  scoreBreakdown: ScoreBreakdown;
  profile: DetectedProfile;
  detectedSkills: SkillGroup[];
  allDetectedSkillNames: string[];
  targetJobRole: string;
  jobMatchScore: number;
  strongMatch: string[];
  partialMatch: string[];
  missingSkills: string[];
  essentialSkills: EssentialSkill[];
  skillGaps: SkillGapItem[];
  atsScore: number;
  atsChecks: AtsCheck[];
  atsRecommendations: string[];
  recommendations: Recommendation[];
  contentAnalysis: ContentAnalysis;
  resumeImprovements: ResumeImprovement[];
  projects: ProjectAnalysis[];
  learningRoadmap: RoadmapPhase[];
  autoDetectedRole: string;
}

export interface ScoreBreakdown {
  atsCompatibility: number;
  skills: number;
  experience: number;
  projects: number;
  education: number;
  resumeStructure: number;
}

export interface DetectedProfile {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  education: string;
  degree: string;
  college: string;
  experience: string;
  experienceCount: string;
  projects: string;
  projectCount: string;
  certifications: string;
  certificationCount: string;
  achievements: string;
  languages: string;
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

export interface EssentialSkill {
  skill: string;
  matched: boolean;
}

export interface SkillGapItem {
  skill: string;
  severity: 'critical' | 'important' | 'strong';
  industryRequirement: number;
  resumeEvidence: string;
  gap: number;
}

export interface AtsCheck {
  label: string;
  passed: boolean;
  detail: string;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ContentAnalysis {
  contactInfo: { label: string; detected: boolean }[];
  education: { label: string; detected: boolean }[];
  experience: { label: string; detected: boolean }[];
  projects: { label: string; detected: boolean }[];
  skills: { label: string; detected: boolean }[];
  certifications: { label: string; detected: boolean }[];
}

export interface ResumeImprovement {
  section: string;
  current: string;
  recommended: string;
}

export interface ProjectAnalysis {
  name: string;
  technologies: string;
  hasImpact: boolean;
  hasLink: boolean;
  strength: number;
  recommendation: string;
}

export interface RoadmapPhase {
  phase: string;
  skills: string[];
}

const skillKeywords: Record<string, string[]> = {
  Python: ['python', 'pandas', 'numpy', 'matplotlib', 'django', 'flask'],
  SQL: ['sql', 'mysql', 'postgresql', 'sqlite', 'oracle', 'database', 'query'],
  Excel: ['excel', 'spreadsheet', 'vlookup', 'pivot table'],
  'Power BI': ['power bi', 'powerbi', 'dax', 'dashboard'],
  Tableau: ['tableau', 'data visualization'],
  Statistics: ['statistics', 'probability', 'regression', 'hypothesis', 'statistical'],
  'Cloud (AWS)': ['aws', 'amazon web services', 'ec2', 's3', 'lambda', 'cloud'],
  Docker: ['docker', 'container', 'containerization'],
  Kubernetes: ['kubernetes', 'k8s', 'orchestration'],
  Linux: ['linux', 'ubuntu', 'shell', 'bash', 'terminal'],
  Networking: ['network', 'tcp/ip', 'routing', 'switching', 'lan', 'wan'],
  SIEM: ['siem', 'splunk', 'security information'],
  Cybersecurity: ['cybersecurity', 'security', 'penetration testing', 'vulnerability', 'encryption'],
  React: ['react', 'reactjs', 'react.js', 'jsx'],
  'Node.js': ['node.js', 'nodejs', 'node', 'express'],
  'Generative AI': ['generative ai', 'llm', 'gpt', 'transformer', 'chatgpt'],
  'Machine Learning': ['machine learning', 'ml', 'scikit-learn', 'tensorflow', 'pytorch', 'deep learning', 'neural network'],
  IoT: ['iot', 'internet of things', 'sensor', 'embedded'],
  Robotics: ['robotics', 'robot', 'automation', 'ros'],
  'PLC Programming': ['plc', 'programmable logic', 'ladder logic'],
  'CAD/CAM': ['cad', 'cam', 'autocad', 'solidworks', 'catia'],
  'EV Technology': ['ev', 'electric vehicle', 'battery', 'powertrain'],
  'Embedded Systems': ['embedded', 'microcontroller', 'arduino', 'raspberry pi', 'stm32'],
  'Financial Analysis': ['financial analysis', 'finance', 'accounting', 'valuation'],
  'Risk Management': ['risk management', 'risk assessment', 'compliance'],
  'Solar Technology': ['solar', 'photovoltaic', 'renewable energy'],
  'Supply Chain Mgmt': ['supply chain', 'logistics', 'inventory', 'procurement'],
  '5G': ['5g', 'telecom', 'telecommunication'],
  'BIM': ['bim', 'building information', 'revit'],
  'Project Management': ['project management', 'agile', 'scrum', 'kanban'],
  Java: ['java', 'spring', 'springboot', 'jvm'],
  'C++': ['c++', 'cpp', 'c plus plus'],
  JavaScript: ['javascript', 'js', 'es6', 'ecmascript'],
  'HTML/CSS': ['html', 'css', 'bootstrap', 'tailwind'],
  MongoDB: ['mongodb', 'mongo', 'nosql'],
  Git: ['git', 'github', 'gitlab', 'version control'],
  'Data Analytics': ['data analytics', 'data analysis', 'data mining', 'bi'],
  'Data Science': ['data science', 'data scientist', 'big data', 'hadoop', 'spark'],
  'Web Development': ['web development', 'web dev', 'frontend', 'backend', 'fullstack', 'full stack'],
  'Digital Marketing': ['digital marketing', 'seo', 'sem', 'social media marketing'],
  'UI/UX': ['ui/ux', 'ux', 'ui design', 'figma', 'user experience', 'user interface', 'wireframe'],
  'Product Management': ['product management', 'product manager', 'product strategy', 'roadmap'],
};

const skillCategories: Record<string, string[]> = {
  Programming: ['Python', 'Java', 'C++', 'JavaScript'],
  'Web Development': ['React', 'Node.js', 'HTML/CSS', 'Web Development'],
  'Data Science': ['Machine Learning', 'Generative AI', 'Data Science', 'Data Analytics', 'Statistics'],
  Cloud: ['Cloud (AWS)'],
  DevOps: ['Docker', 'Kubernetes'],
  Database: ['SQL', 'MongoDB'],
  Security: ['Cybersecurity', 'SIEM'],
  Tools: ['Git', 'Excel', 'Power BI', 'Tableau'],
  Infrastructure: ['Linux', 'Networking', '5G'],
  'Other': ['IoT', 'Robotics', 'PLC Programming', 'CAD/CAM', 'EV Technology', 'Embedded Systems', 'Financial Analysis', 'Risk Management', 'Solar Technology', 'Supply Chain Mgmt', 'BIM', 'Project Management', 'Digital Marketing', 'UI/UX', 'Product Management'],
};

const jobRoleOptions: Record<string, string[]> = {
  'Data Analyst': ['Python', 'SQL', 'Excel', 'Power BI', 'Tableau', 'Statistics', 'Data Analytics'],
  'Software Developer': ['Python', 'Java', 'JavaScript', 'SQL', 'Git', 'HTML/CSS'],
  'Full Stack Developer': ['React', 'Node.js', 'JavaScript', 'Python', 'SQL', 'Git', 'HTML/CSS', 'Docker'],
  'AI/ML Engineer': ['Python', 'Machine Learning', 'Generative AI', 'Statistics', 'Cloud (AWS)', 'Data Science'],
  'Data Scientist': ['Python', 'Machine Learning', 'SQL', 'Statistics', 'Generative AI', 'Data Science'],
  'Cybersecurity Analyst': ['Linux', 'Networking', 'SIEM', 'Cybersecurity', 'Cloud (AWS)'],
  'Cloud Engineer': ['Cloud (AWS)', 'Docker', 'Kubernetes', 'Linux', 'Networking'],
  'DevOps Engineer': ['Docker', 'Kubernetes', 'Cloud (AWS)', 'Linux', 'Git'],
  'Product Manager': ['Project Management', 'Product Management', 'Data Analytics', 'UI/UX'],
  'UI/UX Designer': ['UI/UX', 'HTML/CSS', 'JavaScript', 'Git'],
};

const jobRoleToSkillSyncRole: Record<string, string> = {
  'Data Analyst': 'Data Analyst',
  'Software Developer': 'Full Stack Developer',
  'Full Stack Developer': 'Full Stack Developer',
  'AI/ML Engineer': 'AI Engineer',
  'Data Scientist': 'Data Scientist',
  'Cybersecurity Analyst': 'Cybersecurity Analyst',
  'Cloud Engineer': 'Cloud Engineer',
  'DevOps Engineer': 'DevOps Engineer',
  'Product Manager': 'Project Manager',
  'UI/UX Designer': 'Tableau Developer',
};

function normalize(text: string): string {
  return text.toLowerCase();
}

function detectSkills(text: string): string[] {
  const lower = normalize(text);
  const detected: string[] = [];
  for (const [skill, keywords] of Object.entries(skillKeywords)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      detected.push(skill);
    }
  }
  return [...new Set(detected)];
}

function detectProfile(text: string): DetectedProfile {
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  const phoneMatch = text.match(/(\+?91[-\s]?)?[6-9]\d{9}/);
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  const githubMatch = text.match(/github\.com\/[\w-]+/i);

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const name = lines.length > 0 ? lines[0].split('|')[0].trim().slice(0, 60) : '';

  const eduKeywords = ['b.tech', 'btech', 'b.e', 'bachelor', 'master', 'm.tech', 'mtech', 'mca', 'bca', 'phd', 'diploma', 'degree', 'mba', 'b.sc', 'm.sc', 'b.com', 'engineering'];
  const eduLines = lines.filter((l) => eduKeywords.some((kw) => normalize(l).includes(kw)));
  const education = eduLines.length > 0 ? eduLines[0].slice(0, 100) : '';
  const degreeMatch = education.match(/(b\.tech|btech|b\.e|bachelor|m\.tech|mtech|mca|bca|phd|diploma|mba|b\.sc|m\.sc|b\.com|master)/i);
  const degree = degreeMatch ? degreeMatch[0] : '';

  const collegeKeywords = ['university', 'institute', 'college', 'school of', 'iit', 'nit', 'iiit'];
  const collegeLines = lines.filter((l) => collegeKeywords.some((kw) => normalize(l).includes(kw)));
  const college = collegeLines.length > 0 ? collegeLines[0].slice(0, 100) : '';

  const expKeywords = ['experience', 'worked at', 'intern', 'internship', 'employed', 'work history', 'professional experience', 'work experience'];
  const expLines = lines.filter((l) => expKeywords.some((kw) => normalize(l).includes(kw)));
  const internCount = (text.match(/intern(ship)?/gi) || []).length;
  const experience = expLines.length > 0 ? `${internCount > 0 ? internCount + ' Internship' + (internCount > 1 ? 's' : '') : 'Experience detected'}` : '';
  const experienceCount = internCount > 0 ? `${internCount} Internship${internCount > 1 ? 's' : ''}` : (expLines.length > 0 ? 'Experience detected' : '');

  const projectKeywords = ['project', 'projects', 'developed', 'built', 'created', 'designed', 'implemented'];
  const projectCount = (text.match(/\bproject\b/gi) || []).length;
  const projects = projectCount > 0 ? `${projectCount} project${projectCount > 1 ? 's' : ''} detected` : '';
  const projectCountStr = projectCount > 0 ? `${projectCount}` : '';

  const certKeywords = ['certified', 'certification', 'certificate', 'aws certified', 'google certified', 'microsoft certified', 'coursera', 'udemy', 'edx'];
  const certCount = certKeywords.reduce((count, kw) => count + (text.match(new RegExp(kw, 'gi')) || []).length, 0);
  const certifications = certCount > 0 ? `${certCount} certification${certCount > 1 ? 's' : ''} detected` : '';
  const certificationCount = certCount > 0 ? `${certCount}` : '';

  const achievementKeywords = ['award', 'achievement', 'won', 'winner', 'first place', 'hackathon', 'scholarship', 'rank'];
  const achievementLines = lines.filter((l) => achievementKeywords.some((kw) => normalize(l).includes(kw)));
  const achievements = achievementLines.length > 0 ? `${achievementLines.length} achievement${achievementLines.length > 1 ? 's' : ''} detected` : '';

  const langKeywords = ['english', 'hindi', 'tamil', 'telugu', 'bengali', 'marathi', 'gujarati', 'kannada', 'punjabi', 'malayalam', 'french', 'german', 'spanish'];
  const detectedLangs = langKeywords.filter((lang) => normalize(text).includes(lang));
  const languages = detectedLangs.length > 0 ? detectedLangs.join(', ') : '';

  return {
    name: name || 'Not detected',
    email: emailMatch ? emailMatch[0] : 'Not detected',
    phone: phoneMatch ? phoneMatch[0] : 'Not detected',
    linkedin: linkedinMatch ? linkedinMatch[0] : 'Not detected',
    github: githubMatch ? githubMatch[0] : 'Not detected',
    education: education || 'Not detected',
    degree: degree || 'Not detected',
    college: college || 'Not detected',
    experience: experience || 'Not detected',
    experienceCount: experienceCount || 'Not detected',
    projects: projects || 'Not detected',
    projectCount: projectCountStr || 'Not detected',
    certifications: certifications || 'Not detected',
    certificationCount: certificationCount || 'Not detected',
    achievements: achievements || 'Not detected',
    languages: languages || 'Not detected',
  };
}

function autoDetectRole(detectedSkills: string[]): string {
  let bestRole = 'Data Analyst';
  let bestScore = 0;
  for (const [role, roleSkills] of Object.entries(jobRoleOptions)) {
    const matchCount = roleSkills.filter((s) => detectedSkills.includes(s)).length;
    const score = matchCount / roleSkills.length;
    if (score > bestScore) {
      bestScore = score;
      bestRole = role;
    }
  }
  return bestRole;
}

function groupSkills(detectedSkills: string[]): SkillGroup[] {
  const groups: SkillGroup[] = [];
  for (const [category, catSkills] of Object.entries(skillCategories)) {
    const matched = detectedSkills.filter((s) => catSkills.includes(s));
    if (matched.length > 0) {
      groups.push({ category, skills: matched });
    }
  }
  return groups;
}

function computeJobMatch(detectedSkills: string[], targetRole: string): {
  score: number;
  strong: string[];
  partial: string[];
  missing: string[];
} {
  const roleSkills = jobRoleOptions[targetRole] || jobRoleOptions['Data Analyst'];
  const strong: string[] = [];
  const partial: string[] = [];
  const missing: string[] = [];

  for (const skill of roleSkills) {
    if (detectedSkills.includes(skill)) {
      strong.push(skill);
    } else {
      const keywords = skillKeywords[skill] || [skill.toLowerCase()];
      const hasPartial = keywords.some((kw) => detectedSkills.some((ds) => skillKeywords[ds]?.some((dkw) => dkw.includes(kw) || kw.includes(dkw))));
      if (hasPartial) {
        partial.push(skill);
      } else {
        missing.push(skill);
      }
    }
  }

  const matchCount = strong.length + partial.length * 0.5;
  const score = Math.round((matchCount / roleSkills.length) * 100);
  return { score, strong, partial, missing };
}

function computeSkillGapsForResume(detectedSkills: string[], targetRole: string): SkillGapItem[] {
  const syncRole = jobRoleToSkillSyncRole[targetRole] || targetRole;
  const requiredSkills = getRequiredSkills(syncRole, 'IT & Software');
  const lower = detectedSkills.map((s) => s.toLowerCase());

  const gaps: SkillGapItem[] = requiredSkills.map((skill) => {
    const skillLower = skill.toLowerCase();
    const keywords = skillKeywords[skill] || [skillLower];
    const hasSkill = detectedSkills.includes(skill);
    const hasPartial = keywords.some((kw) => lower.some((l) => l.includes(kw) || kw.includes(l)));

    const industryReq = 75 + Math.floor(Math.random() * 15);
    const resumeCoverage = hasSkill ? industryReq - 5 : hasPartial ? 40 : 0;
    const gap = Math.max(0, industryReq - resumeCoverage);

    let severity: SkillGapItem['severity'] = 'strong';
    if (gap >= 35) severity = 'critical';
    else if (gap >= 15) severity = 'important';

    const evidence = hasSkill ? `${skill} detected in resume` : hasPartial ? `Partial match detected` : 'Not detected';

    return { skill, severity, industryRequirement: industryReq, resumeEvidence: evidence, gap };
  });

  return gaps.sort((a, b) => b.gap - a.gap);
}

function computeAtsScore(text: string, profile: DetectedProfile, detectedSkills: string[], targetRole: string): { score: number; checks: AtsCheck[]; recommendations: string[] } {
  const checks: AtsCheck[] = [];
  const lower = normalize(text);

  checks.push({
    label: 'Standard Section Headings',
    passed: /experience|education|skills|project/i.test(lower),
    detail: /experience|education|skills|project/i.test(lower) ? 'Standard sections detected' : 'Missing standard section headings (Experience, Education, Skills, Projects)',
  });

  checks.push({
    label: 'Contact Information',
    passed: profile.email !== 'Not detected' && profile.phone !== 'Not detected',
    detail: profile.email !== 'Not detected' && profile.phone !== 'Not detected' ? 'Email and phone found' : 'Missing email or phone number',
  });

  checks.push({
    label: 'LinkedIn Profile',
    passed: profile.linkedin !== 'Not detected',
    detail: profile.linkedin !== 'Not detected' ? 'LinkedIn link found' : 'No LinkedIn profile detected — add one for better visibility',
  });

  checks.push({
    label: 'GitHub Profile',
    passed: profile.github !== 'Not detected',
    detail: profile.github !== 'Not detected' ? 'GitHub link found' : 'No GitHub profile detected — recommended for technical roles',
  });

  checks.push({
    label: 'Keyword Relevance',
    passed: detectedSkills.length >= 5,
    detail: detectedSkills.length >= 5 ? `${detectedSkills.length} relevant keywords found` : `Only ${detectedSkills.length} keywords detected — add more role-relevant skills`,
  });

  checks.push({
    label: 'Job-Role Alignment',
    passed: detectedSkills.filter((s) => (jobRoleOptions[targetRole] || []).includes(s)).length >= 3,
    detail: detectedSkills.filter((s) => (jobRoleOptions[targetRole] || []).includes(s)).length >= 3 ? 'Good alignment with target role' : 'Poor alignment — add skills relevant to ' + targetRole,
  });

  checks.push({
    label: 'Experience Section',
    passed: profile.experience !== 'Not detected',
    detail: profile.experience !== 'Not detected' ? 'Experience section detected' : 'No experience section found',
  });

  checks.push({
    label: 'Projects Section',
    passed: profile.projectCount !== 'Not detected' && parseInt(profile.projectCount) > 0,
    detail: profile.projectCount !== 'Not detected' && parseInt(profile.projectCount) > 0 ? `${profile.projectCount} projects found` : 'No projects detected — add projects to strengthen resume',
  });

  checks.push({
    label: 'Education Details',
    passed: profile.degree !== 'Not detected',
    detail: profile.degree !== 'Not detected' ? 'Degree information found' : 'Education details incomplete',
  });

  checks.push({
    label: 'Quantifiable Achievements',
    passed: /\d+%|\d+ times|reduced|increased|improved|achieved/i.test(lower),
    detail: /\d+%|\d+ times|reduced|increased|improved|achieved/i.test(lower) ? 'Quantifiable results found' : 'No quantifiable achievements detected — add metrics like "reduced load time by 25%"',
  });

  const passedCount = checks.filter((c) => c.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);

  const recommendations: string[] = [];
  checks.filter((c) => !c.passed).forEach((c) => recommendations.push(c.detail));

  const roleSkills = jobRoleOptions[targetRole] || [];
  const missingRoleSkills = roleSkills.filter((s) => !detectedSkills.includes(s));
  if (missingRoleSkills.length > 0) {
    recommendations.push(`Add keywords such as ${missingRoleSkills.slice(0, 4).join(', ')} for better alignment with ${targetRole} job descriptions.`);
  }

  return { score, checks, recommendations };
}

function generateRecommendations(
  detectedSkills: string[],
  targetRole: string,
  gaps: SkillGapItem[],
  profile: DetectedProfile,
  text: string
): Recommendation[] {
  const recs: Recommendation[] = [];
  const lower = normalize(text);

  const critical = gaps.filter((g) => g.severity === 'critical');
  const important = gaps.filter((g) => g.severity === 'important');

  critical.slice(0, 2).forEach((g) => {
    recs.push({
      title: `Add ${g.skill}`,
      description: `${g.skill} is frequently required for ${targetRole} roles but was not detected in your resume. Build 2 projects using ${g.skill} and add them to your projects section.`,
      priority: 'high',
    });
  });

  important.slice(0, 2).forEach((g) => {
    recs.push({
      title: `Strengthen ${g.skill}`,
      description: `Your resume shows partial knowledge of ${g.skill}. Add advanced projects demonstrating ${g.skill} in real-world scenarios.`,
      priority: 'medium',
    });
  });

  if (!/\d+%|\d+ times|reduced|increased|improved|achieved/i.test(lower)) {
    recs.push({
      title: 'Add measurable achievements',
      description: 'Instead of "Worked on a website", write "Developed a responsive React website that reduced page load time by 25%." Quantify your impact.',
      priority: 'medium',
    });
  }

  if (profile.github === 'Not detected') {
    recs.push({
      title: 'Add GitHub profile link',
      description: 'Include your GitHub profile URL so recruiters can review your code and projects.',
      priority: 'low',
    });
  }

  if (profile.linkedin === 'Not detected') {
    recs.push({
      title: 'Add LinkedIn profile',
      description: 'Include your LinkedIn profile URL for better professional visibility and networking.',
      priority: 'low',
    });
  }

  if (profile.projectCount === 'Not detected' || parseInt(profile.projectCount || '0') < 2) {
    recs.push({
      title: 'Add more projects',
      description: `Include at least 2-3 relevant projects for ${targetRole} roles. Each project should list technologies used and measurable results.`,
      priority: 'high',
    });
  }

  return recs;
}

function analyzeContent(text: string, profile: DetectedProfile): ContentAnalysis {
  const lower = normalize(text);
  return {
    contactInfo: [
      { label: 'Email', detected: profile.email !== 'Not detected' },
      { label: 'Phone', detected: profile.phone !== 'Not detected' },
      { label: 'LinkedIn', detected: profile.linkedin !== 'Not detected' },
      { label: 'GitHub', detected: profile.github !== 'Not detected' },
      { label: 'Portfolio', detected: /portfolio|personal website|website/i.test(lower) },
    ],
    education: [
      { label: 'Degree', detected: profile.degree !== 'Not detected' },
      { label: 'College/University', detected: profile.college !== 'Not detected' },
      { label: 'Graduation Year', detected: /20\d{2}|graduat/i.test(lower) },
      { label: 'CGPA/Percentage', detected: /cgpa|gpa|percentage|\d+\.\d+\s*(cgpa|gpa)/i.test(lower) },
    ],
    experience: [
      { label: 'Job Title', detected: /developer|engineer|analyst|intern|designer|manager/i.test(lower) },
      { label: 'Company Name', detected: /at\s+[A-Z][a-z]+|pvt|ltd|inc|technologies|solutions/i.test(lower) },
      { label: 'Duration', detected: /\d+\s*(month|year|week)/i.test(lower) || /jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i.test(lower) },
      { label: 'Responsibilities', detected: /responsib|developed|managed|led|built|designed|implemented/i.test(lower) },
      { label: 'Quantifiable Results', detected: /\d+%|\d+ times|reduced|increased|improved|achieved/i.test(lower) },
    ],
    projects: [
      { label: 'Project Name', detected: /project/i.test(lower) },
      { label: 'Technologies Used', detected: /using|technolog|stack|built with/i.test(lower) },
      { label: 'Problem Solved', detected: /problem|solution|solved|addressed|challeng/i.test(lower) },
      { label: 'Results/Impact', detected: /result|impact|outcome|achieved|improved/i.test(lower) },
      { label: 'GitHub/Demo Link', detected: /github\.com|demo|live|deployed/i.test(lower) },
    ],
    skills: [
      { label: 'Technical Skills', detected: /skills?|technolog|tools|framework/i.test(lower) },
      { label: 'Tools', detected: /git|docker|excel|vscode|ide/i.test(lower) },
      { label: 'Frameworks', detected: /react|django|flask|spring|angular|vue/i.test(lower) },
      { label: 'Soft Skills', detected: /communication|teamwork|leadership|collaboration|problem.solving/i.test(lower) },
    ],
    certifications: [
      { label: 'Relevant Certifications', detected: /certif|certified|coursera|udemy|edx|aws certified/i.test(lower) },
    ],
  };
}

function generateResumeImprovements(text: string, detectedSkills: string[], targetRole: string, profile: DetectedProfile): ResumeImprovement[] {
  const improvements: ResumeImprovement[] = [];
  const lower = normalize(text);

  // Professional Summary
  const summaryMatch = text.match(/(summary|objective|profile summary|about me)[:\s]*([^\n]+)/i);
  const currentSummary = summaryMatch ? summaryMatch[2].trim().slice(0, 200) : 'Not detected';
  const topSkills = detectedSkills.slice(0, 4).join(', ');
  const recommendedSummary = detectedSkills.length > 0
    ? `Motivated ${targetRole} with hands-on experience in ${topSkills}. Passionate about applying technical skills to solve real-world problems.`
    : `Motivated ${targetRole} seeking to apply technical skills and contribute to impactful projects.`;
  improvements.push({
    section: 'Professional Summary',
    current: currentSummary,
    recommended: recommendedSummary,
  });

  // Skills Section
  improvements.push({
    section: 'Skills Section',
    current: detectedSkills.length > 0 ? `Detected: ${detectedSkills.join(', ')}` : 'No clear skills section detected',
    recommended: detectedSkills.length > 0
      ? `Organize skills into categories:\n• Programming: ${detectedSkills.filter((s) => ['Python', 'Java', 'C++', 'JavaScript'].includes(s)).join(', ') || 'Add programming languages'}\n• Frameworks: ${detectedSkills.filter((s) => ['React', 'Node.js'].includes(s)).join(', ') || 'Add frameworks'}\n• Tools: ${detectedSkills.filter((s) => ['Git', 'Excel', 'Power BI', 'Tableau'].includes(s)).join(', ') || 'Add tools'}`
      : 'Add a dedicated skills section listing your technical skills, tools, and frameworks.',
  });

  // Experience Section
  improvements.push({
    section: 'Experience Section',
    current: profile.experience !== 'Not detected' ? profile.experience : 'Not detected',
    recommended: 'For each role, include: Job Title | Company | Duration. Use bullet points starting with action verbs (Developed, Built, Led). Add quantifiable results (e.g., "Improved performance by 30%").',
  });

  // Projects Section
  improvements.push({
    section: 'Projects Section',
    current: profile.projectCount !== 'Not detected' ? `${profile.projectCount} projects detected` : 'Not detected',
    recommended: 'For each project include: Name, Technologies, Problem Solved, Results, and GitHub/Demo link. Example: "E-Commerce Website — React, Node.js, MongoDB — Built a full-stack store with 40% faster checkout."',
  });

  // Achievements
  improvements.push({
    section: 'Achievements',
    current: profile.achievements !== 'Not detected' ? profile.achievements : 'Not detected',
    recommended: 'Add a dedicated achievements section. Quantify where possible: "Won 1st place at Smart India Hackathon 2025 out of 200+ teams."',
  });

  return improvements;
}

function analyzeProjects(text: string, detectedSkills: string[]): ProjectAnalysis[] {
  const lower = normalize(text);
  const projectPattern = /(?:project|developed|built|created)[:\s]*([^\n]{5,80})/gi;
  const matches: string[] = [];
  let match;
  while ((match = projectPattern.exec(text)) !== null && matches.length < 5) {
    matches.push(match[1].trim());
  }

  if (matches.length === 0) return [];

  return matches.map((name) => {
    const nameLower = normalize(name);
    const techs = detectedSkills.filter((s) => nameLower.includes(normalize(s)) || skillKeywords[s]?.some((kw) => nameLower.includes(kw)));
    const hasImpact = /\d+%|\d+ times|reduced|increased|improved|achieved|faster|better/i.test(name);
    const hasLink = /github|demo|live|http/i.test(name);
    const strength = Math.min(100, 30 + (techs.length * 15) + (hasImpact ? 25 : 0) + (hasLink ? 15 : 0));
    return {
      name: name.slice(0, 80),
      technologies: techs.length > 0 ? techs.join(', ') : 'Not specified',
      hasImpact,
      hasLink,
      strength,
      recommendation: !hasLink ? 'Add GitHub link and measurable results to increase project credibility.' : hasImpact ? 'Strong project with measurable impact.' : 'Add quantifiable results to demonstrate impact.',
    };
  });
}

function generateRoadmap(missingSkills: string[], targetRole: string): RoadmapPhase[] {
  const syncRole = jobRoleToSkillSyncRole[targetRole] || targetRole;
  const requiredSkills = getRequiredSkills(syncRole, 'IT & Software');
  const gaps = computeSkillGaps([], requiredSkills);
  const missingFromGaps = gaps.filter((g) => g.gap >= 20).map((g) => g.skill);
  const allMissing = [...new Set([...missingSkills, ...missingFromGaps])];

  const learningPath = generateLearningPath(allMissing, targetRole);

  if (learningPath.length === 0) {
    return [{ phase: 'Week 1-2', skills: ['Review and practice existing skills'] }];
  }

  const phases: RoadmapPhase[] = [];
  const phaseSize = learningPath.length <= 4 ? 1 : 2;
  for (let i = 0; i < learningPath.length; i += phaseSize) {
    const phaseNum = Math.floor(i / phaseSize);
    const weekStart = phaseNum * 2 + 1;
    const weekEnd = weekStart + (phaseSize === 2 ? 1 : 0);
    const phaseLabel = phaseSize === 2 && i + phaseSize < learningPath.length
      ? `Week ${weekStart}–${weekEnd}`
      : `Week ${weekStart}`;
    phases.push({
      phase: phaseLabel,
      skills: learningPath.slice(i, i + phaseSize),
    });
  }

  return phases;
}

function computeResumeScore(
  atsScore: number,
  detectedSkills: string[],
  profile: DetectedProfile,
  text: string
): { total: number; breakdown: ScoreBreakdown } {
  const lower = normalize(text);

  const atsCompatibility = Math.round((atsScore / 100) * 25);
  const skillsScore = Math.min(25, Math.round((detectedSkills.length / 10) * 25));
  const hasExp = profile.experience !== 'Not detected';
  const hasQuant = /\d+%|\d+ times|reduced|increased|improved|achieved/i.test(lower);
  const experienceScore = Math.min(20, (hasExp ? 12 : 0) + (hasQuant ? 8 : 0));
  const projectCount = parseInt(profile.projectCount || '0') || 0;
  const projectsScore = Math.min(15, projectCount * 5);
  const hasDegree = profile.degree !== 'Not detected';
  const hasCollege = profile.college !== 'Not detected';
  const educationScore = Math.min(10, (hasDegree ? 5 : 0) + (hasCollege ? 5 : 0));
  const hasSections = /experience|education|skills|project/i.test(lower);
  const resumeStructureScore = hasSections ? 5 : 0;

  const total = atsCompatibility + skillsScore + experienceScore + projectsScore + educationScore + resumeStructureScore;

  return {
    total: Math.min(100, total),
    breakdown: {
      atsCompatibility,
      skills: skillsScore,
      experience: experienceScore,
      projects: projectsScore,
      education: educationScore,
      resumeStructure: resumeStructureScore,
    },
  };
}

export function analyzeResume(text: string, targetJobRole: string): ResumeAnalysis {
  const detectedSkills = detectSkills(text);
  const profile = detectProfile(text);
  const autoRole = autoDetectRole(detectedSkills);
  const role = targetJobRole || autoRole;

  const jobMatch = computeJobMatch(detectedSkills, role);
  const gaps = computeSkillGapsForResume(detectedSkills, role);
  const ats = computeAtsScore(text, profile, detectedSkills, role);
  const recommendations = generateRecommendations(detectedSkills, role, gaps, profile, text);
  const contentAnalysis = analyzeContent(text, profile);
  const improvements = generateResumeImprovements(text, detectedSkills, role, profile);
  const projects = analyzeProjects(text, detectedSkills);
  const roadmap = generateRoadmap(jobMatch.missing, role);
  const scoreResult = computeResumeScore(ats.score, detectedSkills, profile, text);

  const essentialSkills: EssentialSkill[] = (jobRoleOptions[role] || []).map((skill) => ({
    skill,
    matched: detectedSkills.includes(skill),
  }));

  return {
    resumeScore: scoreResult.total,
    scoreBreakdown: scoreResult.breakdown,
    profile,
    detectedSkills: groupSkills(detectedSkills),
    allDetectedSkillNames: detectedSkills,
    targetJobRole: role,
    jobMatchScore: jobMatch.score,
    strongMatch: jobMatch.strong,
    partialMatch: jobMatch.partial,
    missingSkills: jobMatch.missing,
    essentialSkills,
    skillGaps: gaps,
    atsScore: ats.score,
    atsChecks: ats.checks,
    atsRecommendations: ats.recommendations,
    recommendations,
    contentAnalysis,
    resumeImprovements: improvements,
    projects,
    learningRoadmap: roadmap,
    autoDetectedRole: autoRole,
  };
}

export function compareWithJobDescription(
  resumeText: string,
  jobDescription: string,
  targetRole: string
): {
  matchScore: number;
  skillsYouHave: string[];
  skillsMissing: string[];
  recommendedChanges: string[];
} {
  const resumeSkills = detectSkills(resumeText);
  const jdLower = normalize(jobDescription);
  const jdSkills: string[] = [];

  for (const [skill, keywords] of Object.entries(skillKeywords)) {
    if (keywords.some((kw) => jdLower.includes(kw))) {
      jdSkills.push(skill);
    }
  }

  const skillsYouHave = jdSkills.filter((s) => resumeSkills.includes(s));
  const skillsMissing = jdSkills.filter((s) => !resumeSkills.includes(s));

  const matchScore = jdSkills.length > 0
    ? Math.round((skillsYouHave.length / jdSkills.length) * 100)
    : 0;

  const recommendedChanges: string[] = [];
  skillsMissing.slice(0, 5).forEach((skill) => {
    recommendedChanges.push(`Add ${skill} to your skills section — it appears in the job description but was not found in your resume.`);
  });
  if (skillsMissing.length === 0 && jdSkills.length > 0) {
    recommendedChanges.push('Your resume covers all key skills mentioned in the job description. Focus on quantifying your achievements.');
  }
  if (jdSkills.length === 0) {
    recommendedChanges.push('Few technical keywords detected in the job description. Try pasting a more detailed job description.');
  }

  return { matchScore, skillsYouHave, skillsMissing, recommendedChanges };
}

export const targetJobRoles = Object.keys(jobRoleOptions);

export function getRelevantTrainingPrograms(detectedSkills: string[], targetRole: string): typeof trainingPrograms {
  const syncRole = jobRoleToSkillSyncRole[targetRole] || targetRole;
  const requiredSkills = getRequiredSkills(syncRole, 'IT & Software');
  return trainingPrograms.filter((tp) => tp.skills.some((s) => requiredSkills.includes(s)));
}
