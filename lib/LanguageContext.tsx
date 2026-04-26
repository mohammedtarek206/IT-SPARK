'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        home: 'Home',
        tracks: 'Tracks',
        team: 'Team',
        projects: 'Projects',
        partners: 'Partners',
        contact: 'Contact',
        login: 'Login',
        logout: 'Logout',
        dashboard: 'Dashboard',
        admin_panel: 'Admin Panel',
        courses: 'Courses',
        pricing: 'Pricing',
        search: 'Search for courses, instructors...',
        notifications: 'Notifications',
        signup: 'Sign Up',
        my_courses: 'My Courses',
        certificates: 'Certificates',
        profile: 'Profile',
        instructor_dashboard: 'Instructor Dashboard',
        manage_courses: 'Manage Courses',
        manage_exams: 'Manage Exams',
        earnings: 'Total Earnings',
        user_management: 'User Management',
        reports: 'Reports',
        vision: 'Vision',
        mission: 'Mission',
        goals: 'Goals',
        full_name: 'Full Name',
        email_label: 'Email Address',
        phone_label: 'Phone Number',
        password_label: 'Password',
        confirm_password: 'Confirm Password',
        bio_label: 'Short Bio',
        cv_label: 'Upload CV (PDF)',
        image_label: 'Profile Image',
        category_label: 'Category / Field',
        accept_terms: 'I agree to the Terms and Conditions',
        already_have_account: 'Already have an account?',
        dont_have_account: 'Don\'t have an account?',
        remember_me: 'Remember me',
        forgot_password: 'Forgot Password?',
        role_student: 'Student',
        role_instructor: 'Instructor',
        role_selection: 'Choose your account type',
        target_goal_label: 'What is your goal?',
        goal_job: 'Get a Job',
        goal_freelance: 'Freelancing',
        goal_skill: 'Improve Skills',
        signup_success: 'Account created successfully!',
        instructor_pending_msg: 'Your account is pending admin approval.',
        total_students: 'Total Students',
        course_views: 'Course Views',
        avg_rating: 'Avg Rating',
        create_course: 'Create New Course',
        course_title: 'Course Title',
        course_desc: 'Description',
        create_exam: 'Create Exam',
        project_grading: 'Project Grading',
        communications: 'Communications',
        live_sessions: 'Live Sessions',
        stats: 'Statistics',
        active_students: 'Active Students',
        completion_rate: 'Completion Rate',
        feedback_label: 'Feedback',
        grade_label: 'Grade',
        accept_project: 'Accept Project',
        request_revision: 'Request Revision',
        reject_project: 'Reject Project',
        send_announcement: 'Send Announcement',
        add_module: 'Add Module',
        add_lesson: 'Add Lesson',
        start_journey: 'Start Your Journey Now',
        explore_tracks: 'Explore Tracks',
        hero_title: 'IT-SPARK',
        hero_subtitle: 'Empowering the Next Generation of Tech Leaders',
        hero_desc: 'Certified training in Programming, Cybersecurity, and Artificial Intelligence. Transform your passion into expertise.',
        stats_students: 'Students',
        stats_courses: 'Courses',
        stats_employment: 'Employment Rate',
        stats_reviews: 'Student Reviews',
        reviews_title: 'Student Success Stories',
        partners_title: 'Our Partners',
        reviews_1_name: 'Ahmed Ali',
        reviews_1_role: 'Full Stack Developer',
        reviews_1_text: 'IT-SPARK changed my career path completely. The practical projects were the key.',
        reviews_2_name: 'Sara Hassan',
        reviews_2_role: 'Cybersecurity Analyst',
        reviews_2_text: 'The best investment I ever made. The mentors are experts in their fields.',
        tracks_title: 'Available Tracks',
        tracks_subtitle: 'Choose your path to excellence',
        video_btn: 'Watch Intro Video',
        track_web: 'Web Development',
        track_mobile: 'Mobile Development',
        track_cyber: 'Cyber Security',
        track_ai: 'Artificial Intelligence',
        track_freelancing: 'Freelancing & Soft Skills',
        track_web_desc: 'Full-stack development with modern frameworks',
        track_mobile_desc: 'Build cross-platform mobile apps',
        track_cyber_desc: 'Ethical hacking and network security',
        track_ai_desc: 'Machine learning and deep learning',
        track_freelancing_desc: 'Master the art of freelance and communication',
        about_title: 'About IT-SPARK',
        about_subtitle: 'Building the Future of Tech Education',
        about_desc_1: 'IT-SPARK is a leading platform dedicated to empowering youth through specialized training in programming, cybersecurity, and artificial intelligence.',
        about_desc_2: 'We offer a practical, project-based learning experience that bridges the gap between theoretical knowledge and industry requirements.',
        features_title: 'Why Choose IT-SPARK?',
        features_subtitle: 'Excellence in every step of your journey',
        feature_1_title: 'Certified Certificates',
        feature_1_desc: 'Receive internationally recognized certificates upon successful completion of tracks.',
        feature_2_title: 'Expert Mentors',
        feature_2_desc: 'Learn directly from industry experts with years of practical experience.',
        feature_3_title: 'Practical Projects',
        feature_3_desc: 'Build a professional portfolio with real-world graduation projects.',
        feature_4_title: 'Career Support',
        feature_4_desc: 'We help you start your career with CV building and job interview preparation.',
    },
    ar: {
        home: 'الرئيسية',
        tracks: 'المسارات',
        team: 'الفريق',
        projects: 'المشاريع',
        partners: 'الشركاء',
        contact: 'تواصل',
        login: 'دخول',
        logout: 'خروج',
        dashboard: 'لوحة التحكم',
        admin_panel: 'لوحة الإدارة',
        courses: 'الكورسات',
        pricing: 'الباقات',
        search: 'ابحث عن كورس، مدرس...',
        notifications: 'الإشعارات',
        signup: 'إنشاء حساب',
        my_courses: 'كورساتي',
        certificates: 'الشهادات',
        profile: 'الملف الشخصي',
        instructor_dashboard: 'لوحة تحكم المحاضر',
        manage_courses: 'إدارة الكورسات',
        manage_exams: 'إدارة الامتحانات',
        earnings: 'إجمالي الأرباح',
        user_management: 'إدارة المستخدمين',
        reports: 'التقارير',
        vision: 'الرؤية',
        mission: 'الرسالة',
        goals: 'الأهداف',
        full_name: 'الاسم بالكامل',
        email_label: 'البريد الإلكتروني',
        phone_label: 'رقم الهاتف',
        password_label: 'كلمة المرور',
        confirm_password: 'تأكيد كلمة المرور',
        bio_label: 'نبذة شخصية',
        cv_label: 'رفع السيرة الذاتية (PDF)',
        image_label: 'الصورة الشخصية',
        category_label: 'المجال / التخصص',
        accept_terms: 'أوافق على الشروط والأحكام',
        already_have_account: 'لديك حساب بالفعل؟',
        dont_have_account: 'ليس لديك حساب؟',
        remember_me: 'تذكرني',
        forgot_password: 'نسيت كلمة المرور؟',
        role_student: 'طالب',
        role_instructor: 'مدرس',
        role_selection: 'اختر نوع الحساب',
        target_goal_label: 'ما هو هدفك؟',
        goal_job: 'الحصول على وظيفة',
        goal_freelance: 'العمل الحر',
        goal_skill: 'تطوير المهارات',
        signup_success: 'تم إنشاء الحساب بنجاح!',
        instructor_pending_msg: 'حسابك في انتظار موافقة الإدارة.',
        total_students: 'إجمالي الطلاب',
        course_views: 'مشاهدات الكورس',
        avg_rating: 'متوسط التقييم',
        create_course: 'إنشاء كورس جديد',
        course_title: 'عنوان الكورس',
        course_desc: 'الوصف',
        create_exam: 'أنشئ امتحان',
        project_grading: 'تصحيح المشاريع',
        communications: 'التواصل',
        live_sessions: 'جلسات مباشرة',
        stats: 'الإحصائيات',
        active_students: 'الطلاب النشطين',
        completion_rate: 'نسبة الإكمال',
        feedback_label: 'ملاحظات',
        grade_label: 'الدرجة',
        accept_project: 'قبول المشروع',
        request_revision: 'طلب تعديل',
        reject_project: 'رفض المشروع',
        send_announcement: 'إرسال إعلان',
        add_module: 'إضافة وحدة',
        add_lesson: 'إضافة درس',
        start_journey: 'ابدأ رحلتك الآن',
        explore_tracks: 'استكشف المسارات',
        hero_title: 'IT-SPARK',
        hero_subtitle: 'تمكين الجيل القادم من قادة التكنولوجيا',
        hero_desc: 'تدريب معتمد في البرمجة، الأمن السيبراني، والذكاء الاصطناعي. حول شغفك إلى خبرة احترافية.',
        stats_students: 'طالب',
        stats_courses: 'دورة تدريبية',
        stats_employment: 'نسبة التوظيف',
        stats_reviews: 'آراء الطلاب',
        reviews_title: 'قصص نجاح طلابنا',
        partners_title: 'شركاء النجاح',
        reviews_1_name: 'أحمد علي',
        reviews_1_role: 'مطور واجهات كاملة',
        reviews_1_text: 'IT-SPARK غيرت مسار حياتي المهنية تماماً. المشاريع العملية كانت المفتاح.',
        reviews_2_name: 'سارة حسن',
        reviews_2_role: 'محللة أمن سيبراني',
        reviews_2_text: 'أفضل استثمار قمت به على الإطلاق. المدربون خبراء حقيقيون في مجالاتهم.',
        tracks_title: 'المسارات المتاحة',
        tracks_subtitle: 'اختر مسارك نحو التميز',
        video_btn: 'شاهد الفيديو التعريفي',
        track_web: 'تطوير الويب',
        track_mobile: 'تطوير التطبيقات',
        track_cyber: 'الأمن السيبراني',
        track_ai: 'الذكاء الاصطناعي',
        track_freelancing: 'العمل الحر والمهارات الناعمة',
        track_web_desc: 'تطوير المواقع بالكامل بأحدث التقنيات',
        track_mobile_desc: 'بناء تطبيقات موبايل تعمل على كافة الأنظمة',
        track_cyber_desc: 'الاختراق الأخلاقي وأمن الشبكات',
        track_ai_desc: 'تعلم الآلة والذكاء الاصطناعي العميق',
        track_freelancing_desc: 'أتقن فن العمل الحر ومهارات التواصل',
        about_title: 'عن IT-SPARK',
        about_subtitle: 'نبني مستقبل التعليم التقني',
        about_desc_1: 'IT-SPARK هي منصة رائدة تهدف إلى تمكين الشباب من خلال تدريب متخصص في البرمجة، الأمن السيبراني، والذكاء الاصطناعي.',
        about_desc_2: 'نحن نقدم تجربة تعلم قائمة على المشاريع العملية تسد الفجوة بين المعرفة النظرية ومتطلبات سوق العمل.',
        features_title: 'لماذا تختار IT-SPARK؟',
        features_subtitle: 'التميز في كل خطوة من رحلتك',
        feature_1_title: 'شهادات معتمدة',
        feature_1_desc: 'احصل على شهادات معترف بها دولياً عند إتمام المسارات التدريبية بنجاح.',
        feature_2_title: 'خبراء متخصصون',
        feature_2_desc: 'تعلم مباشرة من خبراء الصناعة الذين يمتلكون سنوات من الخبرة العملية.',
        feature_3_title: 'مشاريع عملية',
        feature_3_desc: 'ابنِ معرض أعمال احترافي من خلال مشاريع التخرج الواقعية.',
        feature_4_title: 'دعم مهني',
        feature_4_desc: 'نساعدك في بدء مسيرتك المهنية من خلال بناء السيرة الذاتية والتحضير للمقابلات.',
    },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<Language>('ar'); // Default to Arabic for IT-SPARK

    useEffect(() => {
        const savedLang = localStorage.getItem('lang') as Language;
        if (savedLang) {
            setLangState(savedLang);
        }
    }, []);

    const setLang = (newLang: Language) => {
        setLangState(newLang);
        localStorage.setItem('lang', newLang);
        document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = newLang;
    };

    useEffect(() => {
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
    }, [lang]);

    const t = (key: string) => {
        return translations[lang][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
