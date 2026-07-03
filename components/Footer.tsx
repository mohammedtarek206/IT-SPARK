import Link from 'next/link';
import Image from 'next/image';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiYoutube, FiInstagram } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <Image
                  src="/logo.png"
                  alt="IT-SPARK Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground leading-tight" dir="ltr">IT-SPARK</span>
                <span className="text-[10px] text-accent font-extrabold tracking-wider mt-1" dir="ltr">THERE IS MUCH MORE TO LEARN</span>
              </div>
            </div>
            <p className="text-foreground/60 text-sm leading-relaxed">
              Empowering the next generation of tech leaders through world-class education and hands-on training since 2017.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2 text-foreground/60 text-sm">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/team" className="hover:text-primary transition-colors">Team</Link></li>
              <li><Link href="/projects" className="hover:text-primary transition-colors">Projects</Link></li>
              <li><Link href="/media" className="hover:text-primary transition-colors">Gallery</Link></li>
            </ul>
          </div>

          {/* About Academy */}
          <div>
            <h3 className="font-semibold text-foreground mb-4" dir="rtl">عن الأكاديمية</h3>
            <p className="text-foreground/60 text-sm leading-relaxed" dir="rtl">
              شركة تدريب تأسست عام 2017، تقدم التدريب في المجالات التكنولوجية واللغات للكبار والأطفال. نهدف إلى سد الفجوة بين التعليم النظري ومتطلبات سوق العمل.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Link href="/training-courses" className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all">
                Courses
              </Link>
              <Link href="/apply" className="px-3 py-1 rounded-full text-xs font-bold bg-accent/10 text-accent border border-accent/20 hover:bg-accent hover:text-white transition-all">
                Apply Now
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-center gap-2">
                <FiMail className="text-accent shrink-0" />
                itspark2018@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <FiPhone className="text-accent shrink-0" />
                01010710656
              </li>
              <li className="flex items-start gap-2">
                <FiMapPin className="mt-1 text-accent shrink-0" />
                <span dir="rtl">أسيوط/ شارع المكتبات أعلي صيدلية منال الريفي أبراج الزراعيين - برج أ الدور الثاني علوي</span>
              </li>
            </ul>
            <div className="flex gap-3 mt-6">
              <a href="https://www.facebook.com/itsparkk" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all">
                <FiFacebook className="w-4 h-4" />
              </a>
              <a href="http://www.youtube.com/@itspark2129" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[#FF0000]/10 flex items-center justify-center text-[#FF0000] hover:bg-[#FF0000] hover:text-white transition-all">
                <FiYoutube className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/itspark.training" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[#E4405F]/10 flex items-center justify-center text-[#E4405F] hover:bg-[#E4405F] hover:text-white transition-all">
                <FiInstagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary/20 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} <span dir="ltr">IT-SPARK</span>. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-accent transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
