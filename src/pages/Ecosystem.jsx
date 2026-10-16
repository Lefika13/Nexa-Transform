import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Ecosystem.css';

export const Ecosystem = () => {
  const [activeNode, setActiveNode] = useState(null);

  const nodes = [
    { id: 'bpm', title: 'BPM', x: 50, y: 50, desc: 'Business Process Management: The core discipline of optimising workflows and establishing standardized operating procedures.', color: '#1E6091' },
    { id: 'qms', title: 'QMS', x: 50, y: 22, desc: 'Quality Management Systems: Frameworks for ensuring consistent quality in products and services.', color: '#F97316' },
    { id: 'iso', title: 'ISO 9001:2015', x: 74, y: 36, desc: 'International standard specifying requirements for effective quality management.', color: '#16A34A' },
    { id: 'lss', title: 'LEAN SIX SIGMA', x: 74, y: 64, desc: 'Collaborative methodology to improve performance by systematically removing waste and reducing variation.', color: '#0EA5E9' },
    { id: 'pm', title: 'PROCESS MAP', x: 50, y: 78, desc: 'Visual representation of a workflow, highlighting the steps and decisions involved in a process.', color: '#A855F7' },
    { id: 'sop', title: 'SOP', x: 26, y: 64, desc: 'Standard Operating Procedures detailing documented instructions for routine organizational operations.', color: '#22C55E' },
    { id: 'rca', title: 'RCA', x: 26, y: 36, desc: 'Root Cause Analysis: Specialized problem-solving to identify the fundamental causes of faults and inefficiencies.', color: '#EF4444' }
  ];

  const connections = [
    { from: 'bpm', to: 'qms' },
    { from: 'bpm', to: 'iso' },
    { from: 'bpm', to: 'lss' },
    { from: 'bpm', to: 'pm' },
    { from: 'bpm', to: 'sop' },
    { from: 'bpm', to: 'rca' },
    { from: 'qms', to: 'iso' },
    { from: 'iso', to: 'lss' },
    { from: 'lss', to: 'pm' },
    { from: 'pm', to: 'sop' },
    { from: 'sop', to: 'rca' },
    { from: 'rca', to: 'qms' }
  ];

  const getHexagonPoints = (r) => {
    const w = r * Math.sqrt(3) / 2;
    return `0,-${r} ${w},-${r/2} ${w},${r/2} 0,${r} -${w},${r/2} -${w},-${r/2}`;
  };

  return (
    <div className="ecosystem-root bg-navy min-h-screen text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 to-navy z-0 pointer-events-none"></div>
      
      <section className="py-20 px-4 relative z-10 text-center">
        <div className="container max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Transformation Ecosystem</h1>
          <p className="text-xl text-gray-300">
            Our holistic approach recognises that true transformation requires the seamless integration of process, technology, and people.
          </p>
        </div>
      </section>

      <section className="py-10 relative z-10">
        <div className="container max-w-5xl mx-auto">
          <div className="relative w-full aspect-square md:aspect-video bg-black/20 rounded-3xl border border-white/10 p-8">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              {/* Connections */}
              {connections.map((conn, i) => {
                const n1 = nodes.find(n => n.id === conn.from);
                const n2 = nodes.find(n => n.id === conn.to);
                const isActive = activeNode && (activeNode.id === n1.id || activeNode.id === n2.id);
                const isDimmed = activeNode && !isActive;
                
                return (
                  <motion.line
                    key={i}
                    x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y}
                    stroke={isActive ? '#06B6D4' : 'rgba(255,255,255,0.1)'}
                    strokeWidth="0.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: i * 0.1 }}
                    style={{ opacity: isDimmed ? 0.2 : 1 }}
                  />
                );
              })}

              {/* Nodes as Hexagons */}
              {nodes.map((node) => {
                const isActive = activeNode && activeNode.id === node.id;
                const isDimmed = activeNode && !isActive;

                return (
                  <g 
                    key={node.id} 
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setActiveNode(node)}
                    style={{ cursor: 'pointer', opacity: isDimmed ? 0.3 : 1, transition: 'opacity 0.3s' }}
                  >
                    <motion.polygon
                      points={getHexagonPoints(isActive ? 11 : 9)}
                      fill={node.color}
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 30 }}
                      transition={{ type: 'spring', bounce: 0.5 }}
                      whileHover={{ scale: 1.1 }}
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="0.5"
                    />
                    <text 
                      y="1" 
                      textAnchor="middle" 
                      fill="white" 
                      fontSize="2.2" 
                      fontWeight={isActive ? "bold" : "normal"}
                      pointerEvents="none"
                      style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}
                    >
                      {node.title.includes(' ') ? (
                        <>
                          <tspan x="0" dy="-1">{node.title.split(' ')[0]}</tspan>
                          <tspan x="0" dy="2.5">{node.title.substring(node.title.indexOf(' ') + 1)}</tspan>
                        </>
                      ) : (
                        node.title
                      )}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="absolute bottom-6 left-6 text-sm text-gray-400 bg-navy/80 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
              Click on a node to explore how it connects to the broader ecosystem.
            </div>
          </div>
        </div>
      </section>

      {/* Slide-over Info Panel */}
      <AnimatePresence>
        {activeNode && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm md:hidden"
              onClick={() => setActiveNode(null)}
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }} transition={{ type: 'spring', damping: 25 }}
              className="fixed top-20 right-0 h-[calc(100vh-5rem)] w-full max-w-md bg-navy/95 backdrop-blur-xl border-l border-white/10 z-50 p-8 shadow-2xl flex flex-col"
            >
              <button 
                onClick={() => setActiveNode(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="mt-8 flex-grow">
                <div 
                  className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center text-2xl font-bold bg-white/5 border border-white/10"
                  style={{ color: activeNode.color }}
                >
                  {activeNode.title.charAt(0)}
                </div>
                <h2 className="text-3xl font-bold mb-4">{activeNode.title}</h2>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  {activeNode.desc}
                </p>

                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Ecosystem Connections</h4>
                <ul className="space-y-3 mb-8">
                  {connections.filter(c => c.from === activeNode.id || c.to === activeNode.id).map((c, i) => {
                    const connectedId = c.from === activeNode.id ? c.to : c.from;
                    const connectedNode = nodes.find(n => n.id === connectedId);
                    return (
                      <li key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: connectedNode.color }}></div>
                        <span className="text-sm font-medium">{connectedNode.title}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="pt-6 border-t border-white/10">
                <Link 
                  to="/services" 
                  className="btn bg-white text-navy w-full py-4 text-lg font-bold flex items-center justify-center gap-2 hover:bg-turquoise transition-colors"
                >
                  Explore Service <ArrowRight size={20} />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
