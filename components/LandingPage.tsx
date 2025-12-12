import React from 'react';
import { Activity, Play, Clock, Code2, AlertTriangle, Zap, Brain, Rocket, FileCode2, Clipboard } from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
              <Activity className="text-blue-600 w-7 h-7" />
              <span className="font-bold text-xl tracking-tight text-slate-800">Metrics to Grafana Dashboard</span>
            </div>
            <button 
              onClick={onEnterApp}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-blue-500/30"
            >
              Try it Now
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-blue-100 via-white to-white opacity-70" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            Powered by Gemini 3 Pro
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6">
            Metrics to Grafana Dashboard<br />
            <span className="text-blue-600">with AI</span>
          </h1>
          
          <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Stop building dashboards manually. Paste your raw metrics, and let AI build a production-ready, interactive Grafana dashboard for you instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={onEnterApp}
              className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              <Zap className="w-5 h-5" />
              Generate Dashboard
            </button>
            <button 
              onClick={scrollToHowItWorks}
              className="flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-slate-50 transition-all shadow-sm hover:border-slate-300"
            >
              <Play className="w-5 h-5" />
              See How it Works
            </button>
          </div>
        </div>
      </section>

      {/* Pain Point Section - Light Theme */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-slate-900">The Old Way is Broken</h2>
              <div className="space-y-6">
                {[
                  { icon: Clock, title: 'Hours of Manual Work', desc: 'Understanding metric semantics and designing layouts takes focused effort and time you don\'t have.' },
                  { icon: Code2, title: 'PromQL Headaches', desc: 'Writing efficient PromQL queries is a bottleneck. One syntax error results in "No Data".' },
                  { icon: AlertTriangle, title: 'Fragile Dashboards', desc: 'Manually built dashboards often break when metric names change or when tags are missing.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                      <item.icon className="text-red-500 w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">{item.title}</h3>
                      <p className="text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-lg relative">
                <div className="absolute -top-3 -right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">Query Failed</div>
                <div className="grid grid-cols-2 gap-3">
                  {['warning', 'error'].map((type, i) => (
                    <div key={i} className="h-20 bg-white border border-red-200 rounded-xl flex items-center justify-center text-red-400 flex-col shadow-sm">
                      <AlertTriangle className="w-6 h-6 mb-1" />
                      <span className="text-xs font-medium">{type === 'warning' ? 'No Data' : 'Datasource Error'}</span>
                    </div>
                  ))}
                  <div className="h-16 col-span-2 bg-white border border-red-200 rounded-xl flex items-center justify-center text-red-400 shadow-sm">
                    <span className="font-mono text-xs">parse error at char 12: unknown func</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900">4 Steps to Observability</h2>
            <p className="mt-4 text-xl text-slate-600">From raw text to visualized insights without writing a single line of query code.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Clipboard, title: '1. Paste', desc: 'Input your raw Prometheus metrics text directly into the editor.' },
              { icon: Brain, title: '2. Analyze', desc: 'Gemini 3 Pro analyzes the semantics and structure of your metrics.' },
              { icon: FileCode2, title: '3. Generate', desc: 'AI constructs valid Grafana JSON, choosing the best visualization types.' },
              { icon: Rocket, title: '4. Import', desc: 'Copy the JSON to Grafana and go live instantly in your environment.' },
            ].map((step, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all text-center group">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl mx-auto mb-6 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <step.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-16 text-white text-center shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3" />

            <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">Start Generating Dashboards Today</h2>
            <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 relative z-10">
              Join thousands of DevOps engineers who have reclaimed their time. No more manual JSON editing. No more PromQL errors.
            </p>
            <button 
              onClick={onEnterApp}
              className="bg-white text-blue-700 font-bold py-4 px-10 rounded-xl shadow-lg hover:bg-blue-50 transition-all transform hover:scale-105 relative z-10"
            >
              Try Metrics to Grafana Dashboard AI
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className="text-slate-400 w-5 h-5" />
            <span className="font-bold text-slate-700">Metrics to Grafana Dashboard</span>
          </div>
          <div className="text-slate-500 text-sm">
            © 2025 Metrics to Grafana Dashboard AI. All rights reserved.
          </div>
          <div className="flex gap-4">
            <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">Terms</a>
            <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
