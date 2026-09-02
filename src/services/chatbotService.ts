import { storage } from '@/lib/storage';
import {
  states, industries, skills, jobs, trainingPrograms,
  skillGapSeverity, topEmergingSkills, industryDemandData, stateDemandData,
} from '@/lib/demoData';
import {
  getRequiredSkills, getCurrentCurriculumForProgram, computeSkillGaps,
  generateLearningPath, generateRecommendedModules, computeExpectedImprovement,
} from '@/lib/aiEngine';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: ChatAction[];
  timestamp: string;
}

export interface ChatAction {
  label: string;
  path: string;
}

type Intent =
  | 'GREETING'
  | 'PLATFORM_INFO'
  | 'SKILL_REQUIREMENTS'
  | 'HIGH_DEMAND_SKILLS'
  | 'SKILL_GAP'
  | 'JOB_SEARCH'
  | 'CAREER_GUIDANCE'
  | 'TRAINING_RECOMMENDATION'
  | 'CURRICULUM_RECOMMENDATION'
  | 'INDUSTRY_DEMAND'
  | 'REGIONAL_INSIGHTS'
  | 'EMERGING_SKILLS'
  | 'STUDENT_GUIDANCE'
  | 'COMPARISON'
  | 'RESUME_ANALYSIS'
  | 'HELP'
  | 'UNKNOWN';

interface ResumeAnalysisData {
  resumeScore: number;
  jobMatchScore: number;
  atsScore: number;
  targetJobRole: string;
  allDetectedSkillNames: string[];
  strongMatch: string[];
  partialMatch: string[];
  missingSkills: string[];
  skillGaps: { skill: string; severity: string; gap: number; industryRequirement: number }[];
  recommendations: { title: string; description: string; priority: string }[];
}

function loadResumeAnalysis(): ResumeAnalysisData | null {
  try {
    const raw = localStorage.getItem('skillsync_resume_analysis');
    if (raw) return JSON.parse(raw).analysis as ResumeAnalysisData;
  } catch {
    // ignore
  }
  return null;
}

interface ChatContext {
  lastIntent?: Intent;
  lastJobRole?: string;
  lastIndustry?: string;
  lastState?: string;
}

const allJobRoles = [...new Set(jobs.map((j) => j.role))].sort();
const allStateNames = states.map((s) => s.name);
const allDistricts = states.flatMap((s) => s.districts);
const industryNames = industries.map((i) => i.name);

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

function findMatch<T>(query: string, items: T[], getStr: (item: T) => string): T | undefined {
  const q = normalize(query);
  let best: T | undefined;
  let bestScore = 0;
  for (const item of items) {
    const s = normalize(getStr(item));
    if (s === q) return item;
    if (s.includes(q) && s.length > bestScore) {
      best = item;
      bestScore = s.length;
    }
    if (q.includes(s) && s.length > bestScore) {
      best = item;
      bestScore = s.length;
    }
  }
  return best;
}

function detectIntent(message: string): Intent {
  const q = normalize(message);

  if (/\b(hi|hello|hey|namaste|greetings|good (morning|afternoon|evening))\b/.test(q)) return 'GREETING';
  if (/\b(what.*skillsync|about.*skillsync|what.*sih|sih26134|what.*platform|explain.*skillsync|what.*does.*do)\b/.test(q)) return 'PLATFORM_INFO';
  if (/\b(help|how.*use|guide|instructions?)\b/.test(q) && q.length < 30) return 'HELP';

  if (/\b(compare|comparison|vs|versus|difference between)\b/.test(q)) return 'COMPARISON';

  if (/\b(emerging|trending|fastest.growing|new skills|future skills)\b/.test(q)) return 'EMERGING_SKILLS';
  if (/\b(high demand|in demand|most demanded|demanding|top skills|popular skills|hot skills)\b/.test(q)) return 'HIGH_DEMAND_SKILLS';

  if (/\b(skill gap|gap.*skill|biggest gap|critical gap|missing skill|coverage)\b/.test(q)) return 'SKILL_GAP';

  if (/\b(career|become|learning path|career path|roadmap|what should i learn|how to become|want to be)\b/.test(q)) return 'CAREER_GUIDANCE';

  if (/\b(training|course|program|bootcamp|certification|which.*train)\b/.test(q)) return 'TRAINING_RECOMMENDATION';

  if (/\b(curriculum|syllabus|update.*curriculum|recommend.*module|what.*module)\b/.test(q)) return 'CURRICULUM_RECOMMENDATION';

  if (/\b(industry demand|industry.*score|which.*industry|growth rate|industry growth)\b/.test(q)) return 'INDUSTRY_DEMAND';

  if (/\b(region|state|district|uttar pradesh|maharashtra|karnataka|delhi|tamil nadu|telangana|gujarat|rajasthan|west bengal|haryana|ghaziabad|noida|mumbai|pune|bengaluru|hyderabad|chennai|jaipur|kolkata|gurugram)\b/.test(q)) return 'REGIONAL_INSIGHTS';

  if (/\b(resume|cv|my resume|resume analysis|resume score|ats score|improve.*resume|resume match)\b/.test(q)) return 'RESUME_ANALYSIS';
  if (/\b(student|profile|my skills|match score|employability)\b/.test(q)) return 'STUDENT_GUIDANCE';

  if (/\b(job|jobs|hiring|vacancy|opening|salary|company|companies|find.*work)\b/.test(q)) return 'JOB_SEARCH';

  if (/\b(skills? required|skills? needed|skills? for|what.*skills|required skills|prerequisite)\b/.test(q)) return 'SKILL_REQUIREMENTS';

  return 'UNKNOWN';
}

function findJobRole(message: string): string | undefined {
  const match = findMatch(message, allJobRoles, (r) => r);
  return match;
}

function findIndustry(message: string): string | undefined {
  const match = findMatch(message, industries, (i) => i.name);
  return match?.name;
}

function findState(message: string): string | undefined {
  const match = findMatch(message, states, (s) => s.name);
  return match?.name;
}

function findDistrict(message: string): string | undefined {
  const match = findMatch(message, allDistricts, (d) => d);
  return match;
}

function formatList(items: string[], ordered = false): string {
  if (ordered) {
    return items.map((item, i) => `${i + 1}. ${item}`).join('\n');
  }
  return items.map((item) => `• ${item}`).join('\n');
}

function getSkillRequirementsResponse(role: string): { content: string; actions: ChatAction[] } {
  const requiredSkills = getRequiredSkills(role, 'IT & Software');
  const matchingJobs = jobs.filter((j) => j.role === role);
  const salaryRange = matchingJobs.length > 0
    ? `₹${Math.min(...matchingJobs.map((j) => j.salaryMin))}–${Math.max(...matchingJobs.map((j) => j.salaryMax))} LPA`
    : 'varies by company';

  return {
    content: `Based on the SkillSync demo dataset, the key skills for **${role}** roles are:\n\n${formatList(requiredSkills, true)}\n\nSalary range: ${salaryRange}\n\nThe current training coverage shows significant gaps in some of these skills. Would you like me to analyze the skill gap or create a learning path?`,
    actions: [
      { label: 'View Skill Gap', path: '/skill-gap' },
      { label: 'Create Learning Path', path: '/students' },
    ],
  };
}

function getHighDemandSkillsResponse(): { content: string; actions: ChatAction[] } {
  const top = [...skills].sort((a, b) => b.demand - a.demand).slice(0, 10);
  return {
    content: `Based on the current SkillSync demo dataset, here are the top 10 skills by demand:\n\n${formatList(top.map((s) => `${s.name} — ${s.demand}% demand, ${s.growth}% growth`), true)}\n\nWould you like to explore training programs for any of these skills?`,
    actions: [
      { label: 'View Training Programs', path: '/training' },
      { label: 'View Skill Gap Analysis', path: '/skill-gap' },
    ],
  };
}

function getSkillGapResponse(role: string | undefined): { content: string; actions: ChatAction[] } {
  if (role) {
    const requiredSkills = getRequiredSkills(role, 'IT & Software');
    const currentCurriculum = ['Python', 'SQL', 'Excel', 'Statistics'];
    const gaps = computeSkillGaps(currentCurriculum, requiredSkills);
    const critical = gaps.filter((g) => g.status === 'Critical Gap');
    const partial = gaps.filter((g) => g.status === 'Partial Gap');

    let content = `### Skill Gap Analysis for ${role}\n\nBased on the SkillSync demo dataset:\n\n`;
    if (critical.length > 0) {
      content += `**Critical Gaps:**\n${formatList(critical.map((g) => `${g.skill} — ${g.gap}% gap (Requirement: ${g.industryRequirement}%, Coverage: ${g.trainingCoverage}%)`))}\n\n`;
    }
    if (partial.length > 0) {
      content += `**Partial Gaps:**\n${formatList(partial.map((g) => `${g.skill} — ${g.gap}% gap`))}\n\n`;
    }
    const aligned = gaps.filter((g) => g.status === 'Aligned');
    if (aligned.length > 0) {
      content += `**Well Aligned:**\n${formatList(aligned.map((g) => g.skill))}\n\n`;
    }
    content += `Recommendation: Add practical projects and hands-on training for the critical gap areas to improve employability.`;
    return {
      content,
      actions: [
        { label: 'View Skill Gap', path: '/skill-gap' },
        { label: 'AI Curriculum Advisor', path: '/recommendations' },
      ],
    };
  }

  const critical = skillGapSeverity.filter((s) => s.severity === 'Critical');
  return {
    content: `Based on the SkillSync demo dataset, here are the most critical skill gaps:\n\n${formatList(critical.map((s) => `${s.skill} — ${s.gap}% gap`), true)}\n\nThese gaps indicate that current training programs are not adequately covering these high-demand skills. Would you like to see detailed analysis?`,
    actions: [
      { label: 'View Skill Gap', path: '/skill-gap' },
      { label: 'AI Curriculum Advisor', path: '/recommendations' },
    ],
  };
}

function getCareerGuidanceResponse(role: string): { content: string; actions: ChatAction[] } {
  const requiredSkills = getRequiredSkills(role, 'IT & Software');
  const learningPath = generateLearningPath(requiredSkills, role);

  const students = storage.getStudents();
  let matchInfo = '';
  if (students.length > 0) {
    const student = students[0];
    const matchCount = requiredSkills.filter((s) => student.skills.includes(s)).length;
    const matchPct = Math.round((matchCount / requiredSkills.length) * 100);
    matchInfo = `\n\nBased on your student profile (${student.name}), your current skill match is **${matchPct}%**.`;
  }

  return {
    content: `### Recommended Learning Path for ${role}\n\n${formatList(learningPath, true)}${matchInfo}\n\nWould you like to explore training programs that cover these skills?`,
    actions: [
      { label: 'View Training Programs', path: '/training' },
      { label: 'Student Profile', path: '/students' },
    ],
  };
}

function getTrainingResponse(role: string | undefined): { content: string; actions: ChatAction[] } {
  let relevant = trainingPrograms;
  if (role) {
    const requiredSkills = getRequiredSkills(role, 'IT & Software');
    relevant = trainingPrograms.filter((tp) => tp.skills.some((s) => requiredSkills.includes(s)));
  }

  if (relevant.length === 0) {
    return {
      content: `I couldn't find training programs matching your query in the current SkillSync demo dataset. Here are some popular programs:\n\n${formatList(trainingPrograms.slice(0, 5).map((tp) => `${tp.name} (${tp.provider}) — ${tp.duration}, ${tp.employmentRate}% employment rate`), true)}`,
      actions: [{ label: 'View Training Programs', path: '/training' }],
    };
  }

  return {
    content: `Based on the SkillSync demo dataset, here are recommended training programs${role ? ` for ${role}` : ''}:\n\n${formatList(relevant.slice(0, 5).map((tp) => `${tp.name} (${tp.provider})\n  Duration: ${tp.duration} | Students: ${tp.students} | Employment: ${tp.employmentRate}% | Alignment: ${tp.industryAlignment}%`), true)}\n\nWould you like more details?`,
    actions: [{ label: 'View Training Programs', path: '/training' }],
  };
}

function getCurriculumResponse(role: string | undefined): { content: string; actions: ChatAction[] } {
  const jobRole = role || 'Data Analyst';
  const requiredSkills = getRequiredSkills(jobRole, 'IT & Software');
  const currentCurriculum = getCurrentCurriculumForProgram('Data Analytics Foundation', trainingPrograms);
  const gaps = computeSkillGaps(currentCurriculum, requiredSkills);
  const missing = gaps.filter((g) => g.gap >= 15).map((g) => g.skill);
  const modules = generateRecommendedModules(missing);
  const improvement = computeExpectedImprovement(gaps);

  return {
    content: `### Curriculum Recommendation for ${jobRole}\n\n**Current Curriculum:**\n${formatList(currentCurriculum)}\n\n**Missing Skills:**\n${formatList(missing)}\n\n**Recommended Modules:**\n${formatList(modules.map((m) => m.title), true)}\n\n**Expected Employability Improvement: +${improvement}%**`,
    actions: [{ label: 'Open AI Curriculum Advisor', path: '/recommendations' }],
  };
}

function getIndustryResponse(industryName: string | undefined): { content: string; actions: ChatAction[] } {
  if (industryName) {
    const ind = industries.find((i) => i.name === industryName);
    if (ind) {
      return {
        content: `### ${ind.name} Industry\n\nBased on the SkillSync demo dataset:\n\n• **Demand Score:** ${ind.demandScore}/100\n• **Growth Rate:** ${ind.growth}%\n• **Total Jobs:** ${ind.jobCount.toLocaleString()}\n• **Average Salary:** ₹${ind.avgSalaryMin}–${ind.avgSalaryMax} LPA\n\n**Top Skills:**\n${formatList(ind.topSkills)}\n\n**Critical Skills (Gap Areas):**\n${formatList(ind.criticalSkills)}`,
        actions: [{ label: `Explore ${ind.name}`, path: '/industry' }],
      };
    }
  }

  const top = [...industryDemandData].sort((a, b) => b.demand - a.demand).slice(0, 5);
  return {
    content: `Based on the SkillSync demo dataset, here are the top industries by demand:\n\n${formatList(top.map((i) => `${i.industry} — Demand: ${i.demand}/100, ${i.jobs.toLocaleString()} jobs`), true)}\n\nWould you like to explore a specific industry?`,
    actions: [{ label: 'View Industry Demand', path: '/industry' }],
  };
}

function getRegionalResponse(stateName: string | undefined, district: string | undefined): { content: string; actions: ChatAction[] } {
  if (stateName) {
    const state = states.find((s) => s.name === stateName);
    if (state) {
      let content = `### ${state.name}\n\nBased on the SkillSync demo dataset:\n\n• **Job Demand:** ${state.jobDemand.toLocaleString()}\n• **Skill Gap:** ${state.skillGap}%\n• **Training Programs:** ${state.trainingPrograms}\n• **Employability:** ${state.employability}%\n\n**Top Industries:**\n${formatList(state.topIndustries)}\n\n**High-Demand Skills:**\n${formatList(state.topSkills)}`;
      if (district && state.districts.includes(district)) {
        content += `\n\n**District:** ${district} is part of ${state.name}. Regional data is tracked at the state level.`;
      }
      return {
        content,
        actions: [{ label: 'View Regional Insights', path: '/regional' }],
      };
    }
  }

  if (district) {
    const stateWithDistrict = states.find((s) => s.districts.includes(district));
    if (stateWithDistrict) {
      return getRegionalResponse(stateWithDistrict.name, district);
    }
  }

  const topStates = [...stateDemandData].sort((a, b) => b.demand - a.demand).slice(0, 5);
  return {
    content: `Based on the SkillSync demo dataset, here are the top states by job demand:\n\n${formatList(topStates.map((s) => `${s.state} — Demand: ${s.demand.toLocaleString()}, Gap: ${s.gap}%`), true)}\n\nWould you like to explore a specific state?`,
    actions: [{ label: 'View Regional Insights', path: '/regional' }],
  };
}

function getEmergingSkillsResponse(): { content: string; actions: ChatAction[] } {
  const top = [...topEmergingSkills].sort((a, b) => b.growth - a.growth).slice(0, 8);
  return {
    content: `Based on the SkillSync demo dataset, here are the fastest-growing emerging skills:\n\n${formatList(top.map((s) => `${s.skill} — ${s.growth}% growth, ${s.demand}% demand`), true)}\n\nThese skills are seeing the highest growth in demand across Indian industries.`,
    actions: [
      { label: 'View Dashboard', path: '/dashboard' },
      { label: 'View Training Programs', path: '/training' },
    ],
  };
}

function getStudentGuidanceResponse(): { content: string; actions: ChatAction[] } {
  const students = storage.getStudents();
  if (students.length === 0) {
    return {
      content: `You don't have a student profile yet. Create one to get personalized skill match analysis and learning path recommendations.\n\nI can help you:\n• Calculate your skill match percentage for any job role\n• Identify missing skills\n• Generate a personalized learning path\n\nWould you like to create a student profile?`,
      actions: [{ label: 'Create Student Profile', path: '/students' }],
    };
  }

  const student = students[0];
  const requiredSkills = getRequiredSkills(student.careerInterest, 'IT & Software');
  const matchCount = requiredSkills.filter((s) => student.skills.includes(s)).length;
  const matchPct = Math.round((matchCount / requiredSkills.length) * 100);
  const missing = requiredSkills.filter((s) => !student.skills.includes(s));
  const learningPath = generateLearningPath(missing, student.careerInterest);

  return {
    content: `### Student Profile: ${student.name}\n\n• **Target Career:** ${student.careerInterest}\n• **Skill Match:** ${matchPct}%\n• **Missing Skills:** ${missing.length > 0 ? missing.join(', ') : 'None — fully aligned!'}\n\n**Recommended Learning Path:**\n${formatList(learningPath, true)}`,
    actions: [{ label: 'View Student Profile', path: '/students' }],
  };
}

function getComparisonResponse(message: string): { content: string; actions: ChatAction[] } {
  const ind1 = findIndustry(message);
  const remaining = ind1 ? industries.filter((i) => i.name !== ind1) : industries;
  const ind2 = findMatch(message, remaining, (i) => i.name)?.name;

  if (ind1 && ind2) {
    const i1 = industries.find((i) => i.name === ind1)!;
    const i2 = industries.find((i) => i.name === ind2)!;
    return {
      content: `### Comparison: ${i1.name} vs ${i2.name}\n\nBased on the SkillSync demo dataset:\n\n| Metric | ${i1.name} | ${i2.name} |\n|---|---|---|\n| Demand | ${i1.demandScore}/100 | ${i2.demandScore}/100 |\n| Growth | ${i1.growth}% | ${i2.growth}% |\n| Jobs | ${i1.jobCount.toLocaleString()} | ${i2.jobCount.toLocaleString()} |\n| Salary | ₹${i1.avgSalaryMin}–${i1.avgSalaryMax} LPA | ₹${i2.avgSalaryMin}–${i2.avgSalaryMax} LPA |\n| Top Skill | ${i1.topSkills[0]} | ${i2.topSkills[0]} |\n| Critical Gap | ${i1.criticalSkills[0]} | ${i2.criticalSkills[0]} |`,
      actions: [{ label: 'View Industry Demand', path: '/industry' }],
    };
  }

  const s1 = findState(message);
  const remainingStates = s1 ? states.filter((s) => s.name !== s1) : states;
  const s2 = findMatch(message, remainingStates, (s) => s.name)?.name;

  if (s1 && s2) {
    const st1 = states.find((s) => s.name === s1)!;
    const st2 = states.find((s) => s.name === s2)!;
    return {
      content: `### Comparison: ${st1.name} vs ${st2.name}\n\nBased on the SkillSync demo dataset:\n\n| Metric | ${st1.name} | ${st2.name} |\n|---|---|---|\n| Job Demand | ${st1.jobDemand.toLocaleString()} | ${st2.jobDemand.toLocaleString()} |\n| Skill Gap | ${st1.skillGap}% | ${st2.skillGap}% |\n| Training Programs | ${st1.trainingPrograms} | ${st2.trainingPrograms} |\n| Employability | ${st1.employability}% | ${st2.employability}% |\n| Top Industry | ${st1.topIndustries[0]} | ${st2.topIndustries[0]} |\n| Top Skill | ${st1.topSkills[0]} | ${st2.topSkills[0]} |`,
      actions: [{ label: 'View Regional Insights', path: '/regional' }],
    };
  }

  return {
    content: `I can compare industries or states for you. Try asking:\n\n• "Compare IT and Manufacturing"\n• "Compare Uttar Pradesh and Maharashtra"`,
    actions: [],
  };
}

function getJobSearchResponse(message: string): { content: string; actions: ChatAction[] } {
  const role = findJobRole(message);
  const stateName = findState(message);
  const industryName = findIndustry(message);

  let filtered = jobs;
  if (role) filtered = filtered.filter((j) => j.role === role);
  if (stateName) filtered = filtered.filter((j) => j.state === stateName);
  if (industryName) filtered = filtered.filter((j) => j.industry === industryName);

  if (filtered.length === 0) {
    return {
      content: `I couldn't find jobs matching your criteria in the current SkillSync demo dataset. Try searching with different filters.\n\nThe dataset includes ${jobs.length} jobs across ${industryNames.length} industries and ${allStateNames.length} states.`,
      actions: [{ label: 'View Job Market', path: '/jobs' }],
    };
  }

  const topJobs = filtered.slice(0, 5);
  return {
    content: `Based on the SkillSync demo dataset, I found ${filtered.length} matching jobs:\n\n${formatList(topJobs.map((j) => `${j.role} — ${j.company}, ${j.location} (₹${j.salaryMin}–${j.salaryMax} LPA)`), true)}${filtered.length > 5 ? `\n\n...and ${filtered.length - 5} more.` : ''}`,
    actions: [{ label: 'View Job Market', path: '/jobs' }],
  };
}

function getGreetingResponse(): { content: string; actions: ChatAction[] } {
  return {
    content: `Hello! I'm **SkillSync AI**, your AI-powered skill and career assistant.\n\nI can help you understand skill gaps, industry demand, career paths, training programs, and curriculum recommendations.\n\nTry asking me:\n• "What skills are in high demand?"\n• "What should I learn to become a Data Analyst?"\n• "What are the biggest skill gaps in Uttar Pradesh?"`,
    actions: [],
  };
}

function getPlatformInfoResponse(): { content: string; actions: ChatAction[] } {
  return {
    content: `**SkillSync India** is an AI-powered platform built for the Smart India Hackathon (SIH26134).\n\nIt addresses the challenge of aligning skill development programs with industry requirements and emerging job market demands.\n\nThe platform provides:\n• **Labour Market Intelligence** — real-time analysis of job postings and skill demands\n• **Skill Gap Analysis** — AI-powered comparison between industry needs and training coverage\n• **AI Curriculum Recommendations** — dynamic curriculum modules generated from job role requirements\n• **Regional Workforce Intelligence** — state and district-level insights\n• **Training Program Alignment** — evaluate and align programs with industry standards\n• **Student Career Guidance** — personalized career paths with skill match scores\n\nBased on the current demo dataset: ${jobs.length} jobs, ${skills.length} skills, ${industries.length} industries, ${trainingPrograms.length} training programs, and ${allStateNames.length} states.`,
    actions: [{ label: 'Explore Dashboard', path: '/dashboard' }],
  };
}

function getHelpResponse(): { content: string; actions: ChatAction[] } {
  return {
    content: `I can help you with:\n\n• **Skill Requirements** — "What skills are required for a Data Analyst?"\n• **High Demand Skills** — "Which skills are in high demand in India?"\n• **Skill Gap Analysis** — "What is the biggest skill gap for Data Analysts?"\n• **Career Guidance** — "How do I become a Cloud Engineer?"\n• **Training Recommendations** — "What training should I take?"\n• **Curriculum Updates** — "How should we update the Data Analyst curriculum?"\n• **Industry Demand** — "What skills are demanded in IT?"\n• **Regional Insights** — "What skills are needed in Uttar Pradesh?"\n• **Emerging Skills** — "What are the most demanded AI skills?"\n• **Comparisons** — "Compare IT and Manufacturing"\n• **Job Search** — "Find Data Analyst jobs in Bengaluru"\n\nJust ask me a question in natural language!`,
    actions: [],
  };
}

function getResumeAnalysisResponse(message: string): { content: string; actions: ChatAction[] } {
  const resume = loadResumeAnalysis();
  if (!resume) {
    return {
      content: `You haven't analyzed a resume yet. Upload your resume on the AI Resume Analyzer page to get a detailed analysis including resume score, skill match, ATS compatibility, and personalized recommendations.`,
      actions: [{ label: 'Open Resume Analyzer', path: '/resume-analyzer' }],
    };
  }

  const q = normalize(message);
  const critical = resume.skillGaps.filter((g) => g.severity === 'critical');
  const important = resume.skillGaps.filter((g) => g.severity === 'important');

  if (/\b(improve|fix|better|upgrade|enhance|what should i)\b/.test(q) || /\b(first|priority|start)\b/.test(q)) {
    const topRec = resume.recommendations.find((r) => r.priority === 'high') || resume.recommendations[0];
    if (topRec) {
      return {
        content: `Based on your resume analysis, I recommend improving **${topRec.title}** first.\n\n${topRec.description}\n\nYour resume score is ${resume.resumeScore}/100 with a ${resume.jobMatchScore}% match for ${resume.targetJobRole} roles.`,
        actions: [{ label: 'View Resume Analysis', path: '/resume-analyzer' }],
      };
    }
  }

  if (/\b(gap|missing|lack|need.*skill|what.*skill)\b/.test(q)) {
    const missingList = resume.missingSkills.length > 0 ? resume.missingSkills : critical.map((g) => g.skill);
    return {
      content: `Based on your resume analysis for **${resume.targetJobRole}**, your skill gaps are:\n\n**Critical gaps:**\n${critical.length > 0 ? formatList(critical.map((g) => `${g.skill} (${g.gap}% gap)`)) : 'None'}\n\n**Important gaps:**\n${important.length > 0 ? formatList(important.map((g) => `${g.skill} (${g.gap}% gap)`)) : 'None'}\n\nWould you like me to suggest a learning path?`,
      actions: [{ label: 'View Resume Analysis', path: '/resume-analyzer' }, { label: 'View Training Programs', path: '/training' }],
    };
  }

  if (/\b(score|ats|how.*good|how.*bad|rating)\b/.test(q)) {
    return {
      content: `Based on your resume analysis:\n\n• **Resume Score:** ${resume.resumeScore}/100\n• **Job Market Match:** ${resume.jobMatchScore}% for ${resume.targetJobRole}\n• **ATS Compatibility:** ${resume.atsScore}/100\n• **Critical Gaps:** ${critical.length}\n• **Recommendations:** ${resume.recommendations.length}\n\n${resume.resumeScore >= 70 ? 'Your resume is in good shape!' : 'Your resume needs improvement. Focus on the critical gaps first.'}`,
      actions: [{ label: 'View Resume Analysis', path: '/resume-analyzer' }],
    };
  }

  return {
    content: `Based on your resume analysis for **${resume.targetJobRole}**:\n\n• **Resume Score:** ${resume.resumeScore}/100\n• **Job Market Match:** ${resume.jobMatchScore}%\n• **ATS Score:** ${resume.atsScore}/100\n• **Skills Detected:** ${resume.allDetectedSkillNames.length > 0 ? resume.allDetectedSkillNames.join(', ') : 'None'}\n• **Missing Skills:** ${resume.missingSkills.length > 0 ? resume.missingSkills.join(', ') : 'None'}\n• **Critical Gaps:** ${critical.length}\n\nAsk me "what should I improve first?" or "what are my skill gaps?" for more specific advice.`,
    actions: [{ label: 'View Resume Analysis', path: '/resume-analyzer' }],
  };
}

function getUnknownResponse(): { content: string; actions: ChatAction[] } {
  return {
    content: `I can help with SkillSync India, skill gaps, industry demand, jobs, training programs, curriculum recommendations, and career guidance.\n\nBased on the current SkillSync demo dataset, I can answer questions about ${jobs.length} jobs, ${skills.length} skills, ${industries.length} industries, and ${trainingPrograms.length} training programs.\n\nTry asking me something like:\n• "What skills are required for a Data Analyst?"\n• "Which industries have the highest demand?"\n• "What are the biggest skill gaps in Maharashtra?"`,
    actions: [],
  };
}

export function getChatbotResponse(
  message: string,
  context: ChatContext = {}
): { content: string; actions: ChatAction[] } {
  const intent = detectIntent(message);
  const role = findJobRole(message) || context.lastJobRole;
  const industryName = findIndustry(message) || context.lastIndustry;
  const stateName = findState(message) || context.lastState;
  const district = findDistrict(message);

  switch (intent) {
    case 'GREETING':
      return getGreetingResponse();
    case 'PLATFORM_INFO':
      return getPlatformInfoResponse();
    case 'HELP':
      return getHelpResponse();
    case 'SKILL_REQUIREMENTS':
      if (role) return getSkillRequirementsResponse(role);
      return {
        content: `I can tell you the required skills for any job role. Try asking:\n\n• "What skills are required for a Data Analyst?"\n• "What skills do I need for a Cloud Engineer role?"\n\nAvailable roles in the dataset: ${allJobRoles.slice(0, 10).join(', ')}...`,
        actions: [{ label: 'View Job Market', path: '/jobs' }],
      };
    case 'HIGH_DEMAND_SKILLS':
      return getHighDemandSkillsResponse();
    case 'SKILL_GAP':
      return getSkillGapResponse(role);
    case 'CAREER_GUIDANCE':
      if (role) return getCareerGuidanceResponse(role);
      return {
        content: `I can create a learning path for any career. Try asking:\n\n• "How do I become a Data Analyst?"\n• "What should I learn to become a Cloud Engineer?"\n• "Recommend a learning path for cybersecurity"\n\nAvailable roles: ${allJobRoles.slice(0, 8).join(', ')}...`,
        actions: [{ label: 'Student Profiles', path: '/students' }],
      };
    case 'TRAINING_RECOMMENDATION':
      return getTrainingResponse(role);
    case 'CURRICULUM_RECOMMENDATION':
      return getCurriculumResponse(role);
    case 'INDUSTRY_DEMAND':
      return getIndustryResponse(industryName);
    case 'REGIONAL_INSIGHTS':
      return getRegionalResponse(stateName, district);
    case 'EMERGING_SKILLS':
      return getEmergingSkillsResponse();
    case 'STUDENT_GUIDANCE':
      return getStudentGuidanceResponse();
    case 'COMPARISON':
      return getComparisonResponse(message);
    case 'RESUME_ANALYSIS':
      return getResumeAnalysisResponse(message);
    case 'JOB_SEARCH':
      return getJobSearchResponse(message);
    default:
      // Check for follow-up using context
      if (context.lastIntent && context.lastJobRole) {
        if (/\b(salary|pay|ctc|compensation|package)\b/.test(normalize(message))) {
          const matchingJobs = jobs.filter((j) => j.role === context.lastJobRole);
          if (matchingJobs.length > 0) {
            return {
              content: `Based on the SkillSync demo dataset, salary for **${context.lastJobRole}** roles ranges from ₹${Math.min(...matchingJobs.map((j) => j.salaryMin))}–${Math.max(...matchingJobs.map((j) => j.salaryMax))} LPA.\n\nTop companies hiring:\n${formatList(matchingJobs.slice(0, 5).map((j) => `${j.company} — ${j.location} (₹${j.salaryMin}–${j.salaryMax} LPA)`), true)}`,
              actions: [{ label: 'View Jobs', path: '/jobs' }],
            };
          }
        }
      }
      return getUnknownResponse();
  }
}

export const quickQuestions = [
  { label: 'Top Skills', question: 'Which skills are in high demand in India?' },
  { label: 'Analyze Skill Gap', question: 'What is the biggest skill gap for Data Analysts?' },
  { label: 'Find Career Path', question: 'What should I learn to become a Cloud Engineer?' },
  { label: 'Recommend Training', question: 'What training should I take to become a Data Analyst?' },
  { label: 'Industry Demand', question: 'Which industries have the highest demand?' },
  { label: 'Regional Skills', question: 'What skills are needed in Uttar Pradesh?' },
];

export const welcomeMessage = `Hi! I'm **SkillSync AI**.

I can help you understand skill gaps, industry demand, career paths, training programs and curriculum recommendations.

Try asking:
• What skills are in high demand?
• What should I learn to become a Data Analyst?
• What are the biggest skill gaps in Uttar Pradesh?`;
