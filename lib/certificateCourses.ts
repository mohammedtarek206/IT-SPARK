/** Certificate / training options for public apply form */
export const CERTIFICATE_COURSE_OPTIONS = [
    'IC3',
    'ICDL',
    'MOS',
    'ICDL Teacher',
    'Advanced Excel',
    'AC5',
    'Digital Marketing',
    'HR',
    'English Beginner',
    'English Intermediate',
    'English Advanced',
    'Mobile Maintenance',
    'Graphic Diploma',
    'Photoshop',
    'Illustrator',
    'InDesign',
    'Python Programming',
    'Kids Courses',
    'Data Analysis',
    'TOT',
    'ODOO',
    'React Frontend',
    'Angular Frontend',
    'Mobile App Development',
    'Full Stack .NET',
    'Microsoft Machine Learning',
    'Artificial Intelligence',
    'Cyber Security',
    'CCNA',
    'MCSA',
] as const;

export type CertificateCourseName = (typeof CERTIFICATE_COURSE_OPTIONS)[number];

export const APPLICATION_STATUSES = ['new', 'contacted', 'accepted', 'rejected'] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
