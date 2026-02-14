import type { EcosystemRole } from './roles';

export type ApplicationQuestionType = 'text' | 'textarea' | 'number' | 'select' | 'yesno';

export interface ApplicationQuestion {
  id: string;
  label: string;
  type: ApplicationQuestionType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

const COMMON_QUESTIONS: ApplicationQuestion[] = [
  { id: 'availability', label: 'General availability', type: 'select', required: true, options: ['Weekdays', 'Weeknights', 'Weekends', 'Open availability'] },
  { id: 'startWindow', label: 'How soon can you start?', type: 'select', required: true, options: ['Immediately', 'Within 3 days', 'Within 1 week', 'Within 2 weeks'] },
  { id: 'transport', label: 'Do you have reliable transportation?', type: 'yesno', required: true },
];

const ROLE_SPECIFIC: Record<string, ApplicationQuestion[]> = {
  'delivery-driver': [
    { id: 'vehicleType', label: 'Primary vehicle type', type: 'select', required: true, options: ['Car', 'SUV', 'Scooter', 'Bike', 'Walking'] },
    { id: 'validLicense', label: 'Do you have a valid driver\'s license?', type: 'yesno', required: true },
    { id: 'deliveryApps', label: 'Delivery platforms worked with before (optional)', type: 'text', placeholder: 'DoorDash, Uber Eats, Roadie, etc.' },
    { id: 'drivingNotes', label: 'Anything we should know about your driving experience?', type: 'textarea', placeholder: 'Keep this short and practical.' },
  ],
  'community-courier': [
    { id: 'serviceRadius', label: 'Preferred service radius', type: 'select', required: true, options: ['1-3 miles', '3-5 miles', '5-10 miles'] },
    { id: 'deliveryMethod', label: 'How do you prefer to deliver?', type: 'select', required: true, options: ['Bike', 'Scooter', 'Car', 'Walking'] },
    { id: 'weekendCoverage', label: 'Can you cover weekends?', type: 'yesno', required: true },
  ],
  'bartender-server': [
    { id: 'hospitalityRole', label: 'Primary hospitality role', type: 'select', required: true, options: ['Bartender', 'Server', 'Both'] },
    { id: 'drinkStrength', label: 'Comfort level with classic cocktails', type: 'select', required: true, options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
    { id: 'volumeComfort', label: 'Comfort level in high-volume environments', type: 'select', required: true, options: ['Low', 'Moderate', 'High'] },
    { id: 'certifications', label: 'Relevant certifications (optional)', type: 'text', placeholder: 'RBS, ServSafe, TIPS, etc.' },
  ],
  'kitchen-staff': [
    { id: 'kitchenTrack', label: 'Kitchen focus area', type: 'select', required: true, options: ['Prep', 'Line', 'Expo', 'Dish + support', 'Flexible'] },
    { id: 'stationComfort', label: 'Comfort with fast-paced kitchen stations', type: 'select', required: true, options: ['Beginner', 'Intermediate', 'Advanced'] },
    { id: 'foodSafety', label: 'Food safety certification status', type: 'select', options: ['Current', 'Expired', 'None yet'] },
  ],
  'church-volunteer': [
    { id: 'ministryArea', label: 'Primary ministry area', type: 'select', required: true, options: ['Audio/Visual', 'Hospitality', 'Outreach', 'Operations', 'Youth/Kids'] },
    { id: 'eventAvailability', label: 'Availability for events and services', type: 'select', required: true, options: ['Sundays', 'Weeknights', 'Weekends', 'Flexible'] },
    { id: 'communityExperience', label: 'Community/volunteer experience (optional)', type: 'textarea' },
  ],
  'operations-manager': [
    { id: 'teamSize', label: 'Largest team size managed', type: 'select', required: true, options: ['1-5', '6-15', '16-30', '30+'] },
    { id: 'opsStrength', label: 'Primary operations strength', type: 'select', required: true, options: ['Staffing', 'Service quality', 'Delivery coordination', 'Scheduling + SOPs'] },
    { id: 'multiSite', label: 'Experience with multi-location operations?', type: 'yesno', required: true },
  ],
};

export function getQuestionsForRole(role: EcosystemRole): ApplicationQuestion[] {
  return [...COMMON_QUESTIONS, ...(ROLE_SPECIFIC[role.slug] || [])];
}
