/**
 * Landing Page - FormSync Pipeline System Showcase
 * 
 * Beautiful animated landing page showcasing the complete FormSync pipeline
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Sparkles, Code2, Zap, FileCode, Server, 
  Database, TestTube, ArrowDown, Check, Play 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 px-4 pt-20 pb-32">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20 mb-8">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                AI-Powered Schema-to-Code Pipeline
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
              Schema to Full-Stack
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                in Seconds
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-300 mb-12 max-w-4xl mx-auto">
              Create schemas, validate with AI, and automatically generate frontend forms, 
              backend APIs, DTOs, and test cases – all from one interface.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Link to="/editor">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg text-white px-10 py-6 text-lg font-semibold rounded-xl transition-transform hover:scale-105"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Try It Now
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="px-10 py-6 text-lg font-semibold rounded-xl border-2"
              >
                <Code2 className="mr-2 h-5 w-5" />
                View Documentation
              </Button>
            </div>

            {/* Pipeline Flow Diagram */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="max-w-5xl mx-auto"
            >
              <PipelineFlowDiagram />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 px-4 py-20 bg-neutral-100 dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">FormSync</span> Works
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-300">
              Four simple steps to generate your entire application code
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <StepCard key={step.title} step={step} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Complete Application <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Generation</span>
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-300">
              From one validated schema to a complete, production-ready codebase
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {outputs.map((output, index) => (
              <OutputCard key={output.title} output={output} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Build Faster?
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-8">
                Join developers automating their workflow with FormSync
              </p>
              <Link to="/editor">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-xl text-white px-12 py-6 text-lg font-semibold rounded-xl transition-transform hover:scale-105"
                >
                  Start Creating <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

// Pipeline Flow Diagram Component
const PipelineFlowDiagram = () => {
  const stages = [
    { name: 'Schema Editor', icon: <FileCode className="h-6 w-6" />, color: 'purple' },
    { name: 'Frontend Forms', icon: <Code2 className="h-6 w-6" />, color: 'blue' },
    { name: 'Backend API', icon: <Server className="h-6 w-6" />, color: 'green' },
    { name: 'DTOs & Tests', icon: <TestTube className="h-6 w-6" />, color: 'orange' },
  ];

  return (
    <div className="relative p-8 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => (
          <React.Fragment key={stage.name}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.2, duration: 0.4 }}
              className="flex flex-col items-center gap-3"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br from-${stage.color}-500 to-${stage.color}-600 flex items-center justify-center text-white shadow-lg`}>
                {stage.icon}
              </div>
              <span className="text-sm font-semibold text-center">{stage.name}</span>
            </motion.div>
            
            {index < stages.length - 1 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: index * 0.2 + 0.2, duration: 0.3 }}
                className="flex-1 h-1 bg-gradient-to-r from-purple-400 to-blue-400 mx-4"
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Step Card Component
const StepCard = ({ step, index }: { step: any; index: number }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
  >
    <Card className="h-full border-2 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
      <CardContent className="p-6">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-xl mb-4">
          {index + 1}
        </div>
        <h3 className="text-xl font-bold mb-2">{step.title}</h3>
        <p className="text-neutral-600 dark:text-neutral-300 text-sm">
          {step.description}
        </p>
      </CardContent>
    </Card>
  </motion.div>
);

// Output Card Component
const OutputCard = ({ output, index }: { output: any; index: number }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
  >
    <Card className="h-full border-2 hover:shadow-lg transition-all">
      <CardContent className="p-6">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white mb-4">
          {output.icon}
        </div>
        <h3 className="text-lg font-bold mb-2">{output.title}</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-3">
          {output.description}
        </p>
        <ul className="space-y-1">
          {output.features.map((feature: string) => (
            <li key={feature} className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
              <Check className="h-3 w-3 text-green-600" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  </motion.div>
);

// Data
const steps = [
  {
    title: 'Create Schema',
    description: 'Use the technical editor or drag-and-drop templates to create your JSON schema',
  },
  {
    title: 'Validate & Enhance',
    description: 'AI analyzes your schema and suggests improvements for validation and accessibility',
  },
  {
    title: 'Generate Code',
    description: 'One click generates frontend, backend, DTOs, and tests automatically',
  },
  {
    title: 'Download & Deploy',
    description: 'Get a complete, production-ready codebase ready to integrate',
  },
];

const outputs = [
  {
    icon: <Code2 className="h-7 w-7" />,
    title: 'Frontend Forms',
    description: 'Dynamic React components with validation',
    features: ['Form UI', 'Validation Logic', 'State Management'],
  },
  {
    icon: <Server className="h-7 w-7" />,
    title: 'Backend API',
    description: 'REST endpoints with Express/NestJS',
    features: ['Controllers', 'Routes', 'Middleware'],
  },
  {
    icon: <Database className="h-7 w-7" />,
    title: 'DTOs',
    description: 'TypeScript interfaces and validation',
    features: ['Type Definitions', 'Decorators', 'Validators'],
  },
  {
    icon: <TestTube className="h-7 w-7" />,
    title: 'Test Cases',
    description: 'Automated test suites',
    features: ['Unit Tests', 'E2E Tests', 'Coverage'],
  },
];

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes blob {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(20px, -50px) scale(1.1); }
    50% { transform: translate(-20px, 20px) scale(0.9); }
    75% { transform: translate(50px, 50px) scale(1.05); }
  }
  
  .animate-blob {
    animation: blob 7s infinite;
  }
  
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  
  .animation-delay-4000 {
    animation-delay: 4s;
  }
`;
document.head.appendChild(style);
