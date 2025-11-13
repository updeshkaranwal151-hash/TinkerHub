

import React, { useEffect, useRef, useState } from 'react';
import { Logo } from './Logo.tsx';
import { DatabaseIcon, CloudIcon, AIAssistantIcon, ProjectIcon, ImportIcon, MoonIcon, UserCircleIcon, StarIcon } from './Icons.tsx';


interface LandingPageProps {
    onGetStarted: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; delay: number; innerRef: (el: HTMLDivElement | null) => void; }> = ({ icon, title, children, delay, innerRef }) => (
    <div ref={innerRef} className="fade-in-section bg-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 text-center transition-all duration-300 hover:border-sky-400/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-sky-500/10" style={{ transitionDelay: `${delay}ms` }}>
        <div className="w-16 h-16 mx-auto bg-slate-900 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-700 text-sky-400 mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mt-4">{title}</h3>
        <p className="text-slate-400 mt-2 text-sm">{children}</p>
    </div>
);


const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
    const sectionsRef = useRef<Array<HTMLElement | null>>([]);
    
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        sectionsRef.current.forEach(section => {
            if (section) observer.observe(section);
        });

        return () => observer.disconnect();
    }, []);
    
    const teamMembers = [
        { name: 'Apoorv Karanwal', role: 'Team Leader (Knowledge Warriors)', isLeader: true },
        { name: 'Yogesh Singh', role: 'from Knowledge warriors' },
        { name: 'Divyanshu Singh', role: 'from Knowledge warriors' },
    ];
    
    const features = [
        { icon: <DatabaseIcon className="h-8 w-8 text-current" />, title: 'Smart Inventory', description: 'Easily track components, quantities, and issue history in real-time.' },
        { icon: <ProjectIcon />, title: 'Project Hub', description: 'Organize student projects, link required components, and showcase innovations.' },
        { icon: <AIAssistantIcon />, title: 'AI Lab Assistant', description: 'Get project ideas, inventory reports, and component info with our smart AI.' },
        { icon: <ImportIcon />, title: 'Easy Data Migration', description: 'Import and export your entire inventory with simple CSV files.' },
        { icon: <MoonIcon />, title: 'Sleek Interface', description: 'A modern, intuitive design with both light and dark modes for your comfort.' },
    ];
    
    const leader = teamMembers.find(m => m.isLeader);
    const otherMembers = teamMembers.filter(m => !m.isLeader);


    return (
        <div className="bg-slate-900 text-slate-100 font-sans scroll-smooth">
            <style>{`
                .fade-in-section {
                    opacity: 0;
                    transform: translateY(30px);
                    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
                }
                .fade-in-section.is-visible {
                    opacity: 1;
                    transform: translateY(0);
                }
            `}</style>
            
            <header className="bg-slate-900/70 backdrop-blur-lg shadow-md sticky top-0 z-50">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <a href="#welcome" className="flex items-center gap-3">
                        <Logo className="h-10 w-10" />
                        <span className="text-xl font-bold text-white">TinkerHub</span>
                    </a>
                    <button onClick={onGetStarted} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-5 rounded-lg transition-colors shadow-lg shadow-sky-600/30">
                        Let's Go
                    </button>
                </nav>
            </header>
            
            <main>
                <section id="welcome" ref={el => { sectionsRef.current[0] = el; }} className="fade-in-section container mx-auto px-6 py-24 md:py-32 text-center overflow-hidden">
                     <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                        Welcome to... <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400">
                            TinkerHub
                        </span>
                    </h1>
                    <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                        Seamlessly manage your lab's inventory online. From components to projects, we've got you covered.
                    </p>
                    
                    {/* Creative Cog Element */}
                    <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto mt-16 mb-8">
                        <div className="absolute inset-0 border-2 border-slate-700 rounded-full animate-spin-slow-reverse"></div>
                        <div className="absolute inset-3 border-4 border-slate-800 rounded-full"></div>
                        <div className="absolute inset-3 rounded-full animate-spin-medium" style={{ background: 'conic-gradient(from 90deg, transparent, #34d39966, transparent 30%, transparent)' }}></div>
                        <div className="absolute inset-3 rounded-full animate-spin-fast-reverse" style={{ background: 'conic-gradient(from 210deg, transparent, #38bdf888, transparent 30%, transparent)' }}></div>
                        <div className="absolute inset-8 border-2 border-slate-700/50 rounded-full animate-spin-slow"></div>
                        <div className="absolute inset-10 border-4 border-slate-800 rounded-full"></div>
                        <div className="absolute inset-10 rounded-full animate-spin-medium-reverse" style={{ background: 'conic-gradient(from 0deg, #818cf8, #f97316, #34d399, #38bdf8, #818cf8)' }}></div>
                        <div className="absolute inset-16 bg-slate-900 rounded-full flex items-center justify-center shadow-2xl">
                            <Logo className="w-16 h-16 opacity-90"/>
                        </div>
                    </div>

                    <button onClick={onGetStarted} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg shadow-indigo-600/30 text-lg transform hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/40">
                        Get Started Now
                    </button>
                </section>

                <section id="features" className="py-24 bg-slate-800/50">
                    <div className="container mx-auto px-6">
                        <div ref={el => { sectionsRef.current[1] = el; }} className="fade-in-section text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-sky-400">Everything You Need in One Hub</h2>
                            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">TinkerHub is packed with features to make lab management effortless and innovation limitless.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <FeatureCard key={feature.title} icon={feature.icon} title={feature.title} delay={index * 100} innerRef={el => { sectionsRef.current[2+index] = el; }}>
                                    {feature.description}
                                </FeatureCard>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="vision" className="py-24">
                    <div className="container mx-auto px-6 text-center">
                        <div ref={el => { sectionsRef.current[8] = el; }} className="fade-in-section max-w-4xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-12">
                                From Vision to Victory
                            </h2>
                            <div className="space-y-10">
                                <blockquote ref={el => { sectionsRef.current[9] = el; }} className="fade-in-section" style={{ transitionDelay: '100ms' }}>
                                    <p className="text-xl md:text-2xl font-light text-slate-200 leading-relaxed">
                                        "Every revolutionary idea begins with a single spark, a single component. TinkerHub isn't just an inventory; it's the <span className="font-semibold text-sky-400">launchpad for your next great invention.</span> Stop searching, start creating."
                                    </p>
                                    <footer className="mt-4 text-sm font-semibold text-sky-500 uppercase tracking-widest">
                                        Motivation
                                    </footer>
                                </blockquote>
                                <blockquote ref={el => { sectionsRef.current[10] = el; }} className="fade-in-section" style={{ transitionDelay: '250ms' }}>
                                    <p className="text-xl md:text-2xl font-light text-slate-200 leading-relaxed">
                                        "Success in innovation is born from order, not chaos. By transforming your lab's inventory into a strategic asset, TinkerHub paves the smoothest path from <span className="font-semibold text-green-400">concept to completion.</span>"
                                    </p>
                                    <footer className="mt-4 text-sm font-semibold text-green-500 uppercase tracking-widest">
                                        Success
                                    </footer>
                                </blockquote>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section id="team" className="py-24 bg-slate-800/50">
                    <div className="container mx-auto px-6">
                        <div ref={el => { sectionsRef.current[11] = el; }} className="fade-in-section text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-sky-400">Meet the Team</h2>
                        </div>
                        
                        {/* Leader Card */}
                        <div ref={el => { sectionsRef.current[12] = el; }} className="fade-in-section max-w-3xl mx-auto">
                            {leader && (
                                <div className="relative p-1 bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-400 rounded-2xl shadow-2xl shadow-yellow-500/20">
                                    <div className="bg-slate-800/80 backdrop-blur-lg rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6">
                                        <div className="relative flex-shrink-0">
                                            <div className="w-32 h-32 bg-slate-900 rounded-full flex items-center justify-center border-4 border-amber-400 shadow-lg">
                                                <span className="text-6xl font-bold text-amber-300" style={{ fontFamily: 'serif', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>A</span>
                                            </div>
                                            <div className="absolute -top-3 -right-3">
                                                <StarIcon className="h-10 w-10 text-amber-400 animate-slow-rotate" style={{ filter: 'drop-shadow(0 0 8px #fcd34d)' }} />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-bold text-amber-300 text-center sm:text-left">{leader.name}</h3>
                                            <p className="text-slate-400 mt-1 text-center sm:text-left">{leader.role}</p>
                                            <p className="text-slate-500 mt-3 text-sm text-center sm:text-left">
                                                As the visionary behind TinkerHub, Apoorv leads with a passion for innovation and a commitment to empowering the next generation of creators in Atal Tinkering Labs.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Other Members */}
                        <div className="mt-12">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
                                {otherMembers.map((member, index) => (
                                    <div key={member.name} ref={el => { sectionsRef.current[13 + index] = el; }} className="fade-in-section bg-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8 text-center transition-all duration-300 hover:border-sky-400/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10" style={{ transitionDelay: `${(index + 1) * 150}ms` }}>
                                        <UserCircleIcon className="h-24 w-24 text-slate-700 mx-auto mb-4" />
                                        <h3 className="text-2xl font-bold text-white">{member.name}</h3>
                                        <p className="text-slate-400 mt-1">{member.role}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
                
                <section id="get-started" ref={el => { sectionsRef.current[15] = el; }} className="fade-in-section container mx-auto px-6 py-24 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold">
                        Specially for our <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">ATAL Lab</span>
                    </h2>
                    <p className="mt-4 text-lg text-slate-400">Ready to transform your lab? Jump right in.</p>
                    <button onClick={onGetStarted} className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg shadow-indigo-600/30 text-lg transform hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/40">
                        Get Started Now
                    </button>
                </section>
            </main>

            <footer className="bg-slate-900/50 border-t border-slate-700/50">
                <div ref={el => { sectionsRef.current[16] = el; }} className="fade-in-section container mx-auto px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center items-center gap-3 mb-4">
                        <Logo className="h-8 w-8" />
                        <p className="font-semibold text-slate-300">TinkerHub</p>
                    </div>
                    <p className="text-sm">Crafted with ❤️ by Apoorv Karanwal for the TinkerHub community.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;