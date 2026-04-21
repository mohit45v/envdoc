import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const App: React.FC = () => {
  const [envInput, setEnvInput] = useState(`# Database Configuration\nDB_HOST=localhost\nDB_USER=root\nDB_PASS=supersecret\n\n# Auth Services\nSTRIPE_API_KEY=pk_test_...\nNEXTAUTH_SECRET=...`);
  const [generatedDoc, setGeneratedDoc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const extractEnvKeys = (text: string) => {
    const lines = text.split('\n');
    const keys: string[] = [];
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const parts = trimmed.split('=');
        if (parts[0]) keys.push(parts[0].trim());
      }
    });
    return keys;
  };

  const handleGenerate = async () => {
    setError('');
    const keys = extractEnvKeys(envInput);
    if (keys.length === 0) {
      setError('Please paste some valid .env variables first.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://api.envdoc.site/api/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vars: keys }),
      });

      if (!response.ok) throw new Error('Failed to generate documentation.');

      const data = await response.json();
      
      // Convert JSON response to Markdown table
      let markdown = `# Environment Variables\n\n| Variable | Description | Type | Required | Example |\n|----------|-------------|------|----------|---------|\n`;
      
      Object.entries(data).forEach(([key, value]: [string, any]) => {
        markdown += `| \`${key}\` | ${value.description} | ${value.type} | ${value.required ? 'Yes' : 'No'} | \`${value.example}\` |\n`;
      });

      setGeneratedDoc(markdown);
      
      // Scroll to result
      setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-foreground relative overflow-hidden">
      
      {/* Navigation */}
      <nav className="sticky top-4 z-50 flex items-center justify-between px-8 py-3 w-full bg-background border-[3px] border-border rounded-wobblyLg shadow-hard mx-auto mt-4 max-w-6xl transition-transform duration-200 hover:-rotate-1">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-foreground">edit_document</span>
          <span className="text-2xl font-headline font-bold text-foreground">envdoc-ai</span>
        </div>
        <div className="hidden md:flex gap-8 items-center">
          <a className="text-foreground font-bold border-b-2 border-foreground border-dashed pb-1 hover-jiggle" href="#">Home</a>
          <a className="text-foreground/80 hover:text-foreground transition-colors hover-jiggle" href="#">Docs</a>
          <a className="text-foreground/80 hover:text-foreground transition-colors hover-jiggle" href="https://github.com/mohit45v/envdoc">GitHub</a>
          <a className="text-foreground/80 hover:text-foreground transition-colors hover-jiggle" href="https://www.npmjs.com/package/envdoc-ai" target="_blank" rel="noreferrer">NPM</a>
        </div>
        <button 
          onClick={() => document.getElementById('playground')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-background text-foreground border-[3px] border-border shadow-hard active:shadow-none active:translate-x-[4px] active:translate-y-[4px] px-6 py-2 rounded-wobbly font-body font-bold text-lg hover:bg-accent hover:text-white transition-all"
        >
          Launch App
        </button>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-12">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center text-center py-20 md:py-32">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: -2 }}
            className="absolute top-10 right-20 hidden md:block z-0"
          >
            <div className="px-4 py-2 bg-[#fff9c4] border-2 border-border shadow-hard rounded-wobbly font-body font-bold text-foreground text-xl transform rotate-6">
              📌 It's so easy!
            </div>
          </motion.div>

          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-6 py-2 rounded-wobbly bg-[#fff9c4] border-[3px] border-border text-foreground font-body font-bold text-lg mb-8 shadow-[2px_2px_0px_0px_#2d2d2d] rotate-1"
          >
            v1.0.4 is live
          </motion.span>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-headline font-bold mb-8 leading-[1.2] text-foreground"
          >
            Document your .env <br/>
            <span className="relative inline-block mt-2">
              files instantly!
              <svg className="absolute w-full h-4 -bottom-1 left-0 text-accent" viewBox="0 0 200 20" preserveAspectRatio="none">
                <path d="M0,10 Q50,20 100,10 T200,10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-foreground/80 text-xl md:text-2xl max-w-2xl mb-12 font-body leading-relaxed -rotate-1"
          >
            Transform cryptic environment variables into elegant, structured markdown documentation in seconds. Built for the modern developer.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col md:flex-row items-center gap-6"
          >
            <div className="bg-white border-[3px] border-border px-6 py-3 rounded-wobblyMd flex items-center gap-4 shadow-hard rotate-1">
              <span className="text-foreground font-mono text-lg font-bold">$ npx envdoc-ai</span>
              <span 
                className="material-symbols-outlined text-accent cursor-pointer hover:scale-110 transition-transform"
                onClick={() => navigator.clipboard.writeText('npx envdoc-ai')}
              >
                content_copy
              </span>
            </div>
            <button 
              onClick={() => document.getElementById('playground')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white border-[3px] border-border text-foreground px-8 py-3 rounded-wobbly shadow-hard active:shadow-none active:translate-x-[4px] active:translate-y-[4px] hover:bg-accent hover:text-white transition-all font-body font-bold text-xl -rotate-1"
            >
              View Demo
            </button>
          </motion.div>
        </section>

        {/* Interactive Playground Section */}
        <section id="playground" className="py-24">
          <div className="mb-16 text-center">
            <h2 className="text-4xl md:text-5xl font-headline font-bold mb-4">The Transformation</h2>
            <p className="text-foreground/80 font-body text-xl">From chaos to clarity, automatically.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Input Panel */}
            <motion.div 
              layout
              className="bg-white border-[3px] border-border p-8 rounded-wobblyMd shadow-hard relative hover:-rotate-1 transition-transform group"
            >
              {/* Tape decoration */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-muted/80 rotate-2 mix-blend-multiply"></div>
              
              <div className="flex items-center justify-between mb-6">
                <span className="text-xl font-headline font-bold text-foreground">Input: .env</span>
              </div>
              
              <textarea
                value={envInput}
                onChange={(e) => setEnvInput(e.target.value)}
                className="w-full h-64 bg-transparent font-mono text-base leading-relaxed text-foreground border-2 border-dashed border-border/30 p-4 rounded-wobbly focus:outline-none focus:border-accent resize-none placeholder:text-foreground/40"
                placeholder="Paste your .env variables here..."
              />

              <div className="mt-6 flex justify-between items-center">
                <span className="text-lg text-foreground/80 font-body font-bold">
                  {extractEnvKeys(envInput).length} vars
                </span>
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="bg-white border-[3px] border-border shadow-hard active:shadow-none active:translate-x-[4px] active:translate-y-[4px] text-foreground px-6 py-2 rounded-wobbly font-body font-bold text-xl hover:bg-accent hover:text-white transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-x-[4px] disabled:translate-y-[4px] flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin material-symbols-outlined text-lg">autorenew</span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">auto_awesome</span>
                      Generate
                    </>
                  )}
                </button>
              </div>
              {error && (
                <p className="mt-4 text-accent font-body text-lg border-2 border-accent border-dashed p-3 rounded-wobbly bg-white">
                  {error}
                </p>
              )}
            </motion.div>

            {/* Output Panel */}
            <motion.div 
              layout
              id="result-section"
              className="bg-[#fff9c4] border-[3px] border-border p-8 rounded-wobblyLg shadow-hard relative hover:rotate-1 transition-transform min-h-[400px]"
            >
              {/* Tack decoration */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-accent border-[3px] border-border shadow-[2px_2px_0px_0px_#2d2d2d] z-10"></div>
              
              <div className="flex items-center justify-between mb-6 mt-4">
                <span className="text-xl font-headline font-bold text-foreground">ENV.md Output</span>
                {generatedDoc && (
                  <button 
                    onClick={() => navigator.clipboard.writeText(generatedDoc)}
                    className="px-3 py-1 bg-white border-2 border-border shadow-[2px_2px_0px_0px_#2d2d2d] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] rounded-wobbly text-foreground font-body font-bold text-sm hover:bg-secondary-accent hover:text-white transition-all"
                  >
                    COPY MARKDOWN
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {!generatedDoc ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full text-center py-20"
                  >
                    <span className="material-symbols-outlined text-6xl text-border/20 mb-4 float-anim">edit_note</span>
                    <p className="text-foreground/60 font-body text-xl max-w-[200px]">
                      Your markdown will appear here!
                    </p>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="prose prose-sm max-w-none font-body text-lg"
                  >
                    <div 
                      className="markdown-content"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(generatedDoc) as string) }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-24 border-t-4 border-dashed border-border/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-wobblyMd border-[3px] border-border shadow-hard transform rotate-1 hover:-rotate-1 transition-transform">
              <div className="w-16 h-16 rounded-wobbly bg-muted flex items-center justify-center mb-6 border-2 border-border shadow-[2px_2px_0px_0px_#2d2d2d]">
                <span className="material-symbols-outlined text-3xl text-foreground">terminal</span>
              </div>
              <h4 className="text-2xl font-headline font-bold mb-4">1. Initialize</h4>
              <p className="text-foreground/80 font-body text-xl">Run a single command to scan your project. No configuration needed.</p>
            </div>
            
            <div className="bg-white p-8 rounded-wobblyMd border-[3px] border-border shadow-hard transform -rotate-2 hover:rotate-1 transition-transform">
              <div className="w-16 h-16 rounded-wobbly bg-muted flex items-center justify-center mb-6 border-2 border-border shadow-[2px_2px_0px_0px_#2d2d2d]">
                <span className="material-symbols-outlined text-3xl text-foreground">psychology</span>
              </div>
              <h4 className="text-2xl font-headline font-bold mb-4">2. AI Analysis</h4>
              <p className="text-foreground/80 font-body text-xl">Our engine identifies variable types, default values, and writes descriptions.</p>
            </div>
            
            <div className="bg-white p-8 rounded-wobblyMd border-[3px] border-border shadow-hard transform rotate-1 hover:-rotate-2 transition-transform">
              <div className="w-16 h-16 rounded-wobbly bg-muted flex items-center justify-center mb-6 border-2 border-border shadow-[2px_2px_0px_0px_#2d2d2d]">
                <span className="material-symbols-outlined text-3xl text-foreground">auto_awesome</span>
              </div>
              <h4 className="text-2xl font-headline font-bold mb-4">3. Export</h4>
              <p className="text-foreground/80 font-body text-xl">Generate beautiful Markdown docs that keep everyone in sync.</p>
            </div>
          </div>
        </section>

        {/* Features Bento */}
        <section className="py-24">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-auto">
            
            <div className="md:col-span-8 bg-white rounded-wobblyLg border-[3px] border-border p-10 shadow-hard relative overflow-hidden group min-h-[300px] hover:rotate-1 transition-transform">
              {/* Tape */}
              <div className="absolute top-4 left-6 w-16 h-6 bg-accent/20 rotate-12 mix-blend-multiply"></div>
              
              <div className="relative z-10">
                <h3 className="text-4xl font-headline font-bold mb-4 text-foreground">CI/CD Integrated</h3>
                <p className="text-foreground/80 font-body text-xl max-w-md mb-8">Never ship without documentation. Our GitHub Action ensures your ENV.md is always up to date.</p>
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-muted rounded-wobbly border-2 border-border shadow-[2px_2px_0px_0px_#2d2d2d] flex items-center justify-center hover:bg-secondary-accent hover:text-white transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-3xl">sync_alt</span>
                  </div>
                  <div className="w-16 h-16 bg-muted rounded-wobbly border-2 border-border shadow-[2px_2px_0px_0px_#2d2d2d] flex items-center justify-center hover:bg-accent hover:text-white transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-3xl">history</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-4 bg-accent rounded-wobbly border-[3px] border-border p-10 flex flex-col justify-end shadow-hard transform -rotate-1 hover:rotate-2 transition-transform min-h-[300px]">
              <span className="material-symbols-outlined text-6xl text-white mb-8 hover-jiggle">security</span>
              <h3 className="text-4xl font-headline font-bold text-white mb-4">Privacy First.</h3>
              <p className="text-white font-body text-xl">Secrets never leave your machine.</p>
            </div>
            
            <div className="md:col-span-12 bg-[#fff9c4] rounded-wobblyMd border-[3px] border-border p-10 shadow-hard flex flex-col md:flex-row items-center justify-between min-h-[250px] transform rotate-1 hover:-rotate-1 transition-transform">
              <div className="mb-6 md:mb-0">
                <h3 className="text-4xl font-headline font-bold mb-2 text-foreground">Zero Config.</h3>
                <p className="text-foreground/80 font-body text-2xl">Works instantly with Vite, Next.js, and more.</p>
              </div>
              <span className="material-symbols-outlined text-8xl text-foreground float-anim">bolt</span>
            </div>
            
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 text-center">
          <div className="bg-white p-16 rounded-wobblyLg border-[4px] border-border shadow-hard-emphasized relative overflow-hidden transform -rotate-1">
            <h2 className="text-5xl md:text-6xl font-headline font-bold mb-10 text-foreground">Ready to clear the fog?</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <button className="w-full md:w-auto bg-white border-[3px] border-border shadow-hard active:shadow-none active:translate-x-[4px] active:translate-y-[4px] text-foreground px-10 py-4 rounded-wobbly font-body font-bold text-2xl hover:bg-accent hover:text-white transition-all transform rotate-2">
                Get Started Free
              </button>
              <button className="w-full md:w-auto bg-muted border-[3px] border-border shadow-hard active:shadow-none active:translate-x-[4px] active:translate-y-[4px] text-foreground px-10 py-4 rounded-wobbly font-body font-bold text-2xl hover:bg-secondary-accent hover:text-white transition-all transform -rotate-2">
                Read the Docs
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-[4px] border-dashed border-border/30 py-12 px-8 mt-24">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-5xl mx-auto gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-foreground">edit_document</span>
              <span className="text-2xl font-headline font-bold text-foreground">envdoc-ai</span>
            </div>
            <p className="text-lg font-body text-foreground/80 font-bold">
              © 2024 envdoc-ai. Built with ❤️ and scribbles.
            </p>
          </div>
          <div className="flex gap-8">
            <a className="text-xl font-body text-foreground/80 hover:text-accent hover:underline decoration-wavy transition-all font-bold" href="#">Docs</a>
            <a className="text-xl font-body text-foreground/80 hover:text-accent hover:underline decoration-wavy transition-all font-bold" href="#">Changelog</a>
            <a className="text-xl font-body text-foreground/80 hover:text-accent hover:underline decoration-wavy transition-all font-bold" href="#">GitHub</a>
          </div>
        </div>
      </footer>

      <style>{`
        .markdown-content table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 1.1rem;
          background: #ffffff;
          border: 3px solid #2d2d2d;
          border-radius: 15px 225px 15px 255px / 255px 15px 225px 15px;
          overflow: hidden;
          table-layout: fixed;
          word-wrap: break-word;
        }
        .markdown-content th {
          background: #e5e0d8;
          color: #2d2d2d;
          text-align: left;
          padding: 16px;
          font-family: 'Kalam', cursive;
          font-size: 1.3rem;
          border-bottom: 3px solid #2d2d2d;
          border-right: 2px dashed #2d2d2d;
        }
        .markdown-content th:last-child {
          border-right: none;
        }
        .markdown-content td {
          padding: 14px 16px;
          border-bottom: 2px dashed #2d2d2d;
          border-right: 2px dashed #2d2d2d;
          color: #2d2d2d;
          overflow-wrap: anywhere;
        }
        .markdown-content td:last-child {
          border-right: none;
        }
        .markdown-content tr:last-child td {
          border-bottom: none;
        }
        .markdown-content code {
          background: rgba(45, 93, 161, 0.1);
          padding: 2px 6px;
          border: 1px solid #2d5da1;
          border-radius: 4px;
          color: #2d5da1;
          font-family: monospace;
          font-weight: bold;
          word-break: break-all;
        }
        .markdown-content h1 {
          font-family: 'Kalam', cursive;
          font-size: 2.5rem;
          margin-bottom: 1rem;
          border-bottom: 3px solid #2d2d2d;
          display: inline-block;
          padding-bottom: 0.2rem;
        }
      `}</style>
    </div>
  );
};

export default App;
