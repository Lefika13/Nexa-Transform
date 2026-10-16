import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Search, Filter, ArrowRight, Sparkles, 
  Users, CheckCircle2, Globe, Wifi, Zap 
} from 'lucide-react';
import './TrainingAcademy.css';

export const TrainingAcademy = () => {
  const { programmes } = useData();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'All',
    'Digital Skills & AI',
    'Digital Transformation',
    'Organisational Development',
    'BPM',
    'Transformation Strategy',
    'Operations Management',
    'Institutional Development'
  ];

  const filteredProgrammes = (programmes || []).filter(p => {
    const matchesCategory = activeCategory === 'All' 
      || p.category === activeCategory
      || (activeCategory === 'Digital Skills & AI' && (p.category === 'Digital Skills & AI' || p.slug?.includes('applied-digital-skills')));
    const titleMatch = (p.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const outcomesMatch = typeof p.outcomes === 'string' ? p.outcomes.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const outcomesArrayMatch = Array.isArray(p.completion_outcomes) 
      ? p.completion_outcomes.some(o => o.toLowerCase().includes(searchQuery.toLowerCase())) 
      : false;
    const toolsMatch = Array.isArray(p.practical_tools)
      ? p.practical_tools.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      : false;
    const summaryMatch = typeof p.summary === 'string' ? p.summary.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const aboutMatch = typeof p.about === 'string' ? p.about.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    return matchesCategory && (titleMatch || outcomesMatch || outcomesArrayMatch || toolsMatch || summaryMatch || aboutMatch);
  });

  return (
    <div className="academy-root">
      <section className="bg-navy text-white py-20 px-4">
        <div className="container text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-turquoise text-xs font-bold uppercase tracking-wider mb-4 border border-white/15">
            <Sparkles size={14} /> Skills Development & Transformation
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Training Academy</h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Empower yourself and your workforce with industry-aligned skills programmes. Select any module to view complete outcomes and supported roles.
          </p>
        </div>
      </section>

      {/* Nationwide Online Delivery & Inclusive Access Banner */}
      <section className="bg-white border-b border-gray-200 py-12 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-navy mb-3">
              Nationwide Online Delivery &amp; Inclusive Access
            </h2>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              Designed so that any learner or organisation across South Africa can participate, regardless of geographical location, load shedding schedules or mobile data limits.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-glacial border border-gray-100 flex flex-col items-start hover:border-turquoise/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-navy/5 text-turquoise flex items-center justify-center mb-4">
                <Globe size={24} />
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">
                All 9 Provinces Covered
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                100% remote digital delivery, virtual cohorts and enterprise webinars accessible anywhere in South Africa — from Gauteng and Western Cape to KZN, Eastern Cape, Free State, Mpumalanga, Limpopo, North West and Northern Cape.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-glacial border border-gray-100 flex flex-col items-start hover:border-turquoise/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-navy/5 text-turquoise flex items-center justify-center mb-4">
                <Wifi size={24} />
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">
                Data-Smart &amp; Offline Ready
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Built for digital inclusion with lightweight micro-learning modules and one-click batch ZIP study packs. Download materials once at a community library or Wi-Fi hotspot and study completely offline without burning mobile data.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-glacial border border-gray-100 flex flex-col items-start hover:border-turquoise/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-navy/5 text-turquoise flex items-center justify-center mb-4">
                <Zap size={24} />
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">
                Load Shedding Resilient
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Flexible 24/7 asynchronous study schedules, continuous auto-saving on all assessments, and a lightweight mobile portal optimised for any smartphone screen so power interruptions never derail your progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-glacial border-b border-gray-200">
        <div className="container">
          <div className="academy-controls-bar">
            <div className="academy-search-wrap">
              <Search className="academy-search-icon" size={20} />
              <input
                type="text"
                placeholder="Search modules, outcomes, or roles..."
                className="academy-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="academy-filter-container">
              <div className="academy-filter-header">
                <div className="academy-filter-header-left">
                  <Filter size={15} className="text-turquoise" />
                  <span>Filter by Category:</span>
                </div>
                {activeCategory !== 'All' && (
                  <button
                    onClick={() => setActiveCategory('All')}
                    className="academy-filter-reset"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
              <div className="academy-filter-scroll hide-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`academy-filter-pill ${activeCategory === cat ? 'active' : ''}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProgrammes.length > 0 ? (
              filteredProgrammes.map(prog => {
                const moduleSlug = prog.slug || prog.id;
                const outcomesCount = Array.isArray(prog.completion_outcomes) ? prog.completion_outcomes.length : null;
                const rolesCount = Array.isArray(prog.supported_roles) ? prog.supported_roles.length : null;
                return (
                  <div
                    key={prog.id || prog.slug}
                    className={`glass-card bg-white overflow-hidden flex flex-col h-full hover:shadow-2xl transition-all duration-300 rounded-2xl group ${
                      prog.is_featured 
                        ? 'border-2 border-turquoise shadow-xl shadow-turquoise/10 ring-4 ring-turquoise/10' 
                        : 'border border-gray-100'
                    }`}
                  >
                    <Link to={`/training-academy/${moduleSlug}`} className="h-48 overflow-hidden relative block cursor-pointer">
                      <img
                        src={prog.image}
                        alt={prog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80'; }}
                      />
                      {prog.is_featured && (
                        <div className="absolute top-4 left-4">
                          <span className="text-xs font-bold px-3 py-1 rounded-full shadow-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white border border-emerald-400/40 flex items-center gap-1.5">
                            <Sparkles size={12} /> {prog.badge || 'High Demand'}
                          </span>
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <span className="text-xs font-bold px-3 py-1 rounded-full shadow-sm bg-navy text-turquoise border border-turquoise/30">
                          {prog.delivery || 'Blended & Digital'}
                        </span>
                      </div>
                    </Link>

                    <div className="p-6 flex flex-col flex-grow">
                      {prog.is_featured && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-turquoise uppercase tracking-wider mb-2">
                          <Sparkles size={13} /> Featured In-Demand Programme
                        </div>
                      )}
                      <Link to={`/training-academy/${moduleSlug}`}>
                        <h3 className="text-xl font-bold text-navy mb-3 group-hover:text-turquoise transition-colors cursor-pointer">
                          {prog.title}
                        </h3>
                      </Link>

                      <div className="mb-4 flex-grow">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1.5">
                          <BookOpen size={14} className="text-turquoise" /> About Programme
                        </h4>
                        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                          {prog.about || prog.summary || prog.outcomes}
                        </p>
                      </div>

                      {/* Quick stats row */}
                      {(outcomesCount || rolesCount) && (
                        <div className="flex items-center gap-4 mb-4 py-3 border-y border-gray-100">
                          {outcomesCount && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <CheckCircle2 size={13} className="text-emerald-500" />
                              <span><span className="text-navy font-semibold">{outcomesCount}</span> outcomes</span>
                            </div>
                          )}
                          {rolesCount && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Users size={13} className="text-turquoise" />
                              <span><span className="text-navy font-semibold">{rolesCount}</span> supported roles</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-col gap-2">
                        <Link
                          to={`/training-academy/${moduleSlug}`}
                          className="btn btn-primary w-full text-center flex items-center justify-center gap-2 font-bold py-2.5"
                        >
                          <span>Explore Module Details</span>
                          <ArrowRight size={16} />
                        </Link>

                        <Link
                          to={`/contact?programme=${encodeURIComponent(prog.title)}&enquiry_type=Training%20Enquiry`}
                          className="btn btn-outline border-navy text-navy hover:bg-navy hover:text-white w-full text-center text-xs py-2"
                        >
                          Enquire Now
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-xl text-gray-500">No programmes found matching your criteria.</p>
                <button
                  onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                  className="mt-4 text-blue hover:text-turquoise font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
