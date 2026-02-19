/**
 * Landing Page - FormSync Pipeline System Showcase
 *
 * Professional SaaS-level landing page with modern design
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Code2,
  FileCode,
  Server,
  Database,
  TestTube,
  Check,
  Play,
  Shield,
  FileJson,
  Workflow,
  Github,
  BookOpen,
  Layout,
  Wand2,
  Package,
  Terminal,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Footer } from '../components/layout/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      {/* Gradient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Top gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>

        {/* Subtle animated blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 px-4 pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-200 dark:border-purple-800 bg-purple-50/80 dark:bg-purple-950/30 mb-8 backdrop-blur-sm hover:shadow-md transition-shadow"
              >
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  AI-Powered Schema Automation
                </span>
              </motion.div>

              {/* Main Headline with animated gradient */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
                Transform Schemas into
                <br />
                <motion.span
                  className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent inline-block"
                  animate={{
                    backgroundPosition: ['0%', '100%', '0%'],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{ backgroundSize: '200% auto' }}
                >
                  Production Code
                </motion.span>
              </h1>

              <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 mb-8 leading-relaxed max-w-xl">
                Validate, enhance, and generate full-stack applications from JSON Schema. Create
                forms, APIs, DTOs, and tests—all powered by AI.
              </p>

              {/* CTA Buttons with enhanced animations */}
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-12">
                <Link to="/editor">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="lg"
                      className="relative bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-2xl text-white px-8 py-6 text-base font-semibold rounded-lg transition-all overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center">
                        <Play className="mr-2 h-5 w-5" />
                        Get Started
                      </span>
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-30 blur-xl transition-opacity"></div>
                    </Button>
                  </motion.div>
                </Link>
                <a href="https://github.com/formsync" target="_blank" rel="noopener noreferrer">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="px-8 py-6 text-base font-semibold rounded-lg border-2 border-neutral-300 dark:border-neutral-700 hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all text-neutral-700 dark:text-neutral-300 backdrop-blur-sm"
                    >
                      <BookOpen className="mr-2 h-5 w-5" />
                      View Documentation
                    </Button>
                  </motion.div>
                </a>
              </div>

              {/* Trust Indicators with animation */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center gap-6 text-sm text-neutral-600 dark:text-neutral-400"
              >
                {[
                  { icon: Check, text: 'Multi-format support' },
                  { icon: Check, text: 'AI-enhanced validation' },
                  { icon: Check, text: 'Production-ready' },
                ].map((item, i) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <item.icon className="h-4 w-4 text-green-600" />
                    <span>{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Visual Preview with floating badges */}
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              {/* Floating status badges */}
              <motion.div
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -top-4 -left-4 z-20"
              >
                <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2 flex items-center gap-2 backdrop-blur-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Validated
                  </span>
                </div>
              </motion.div>

              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
                className="absolute -bottom-4 -right-4 z-20"
              >
                <div className="bg-purple-600 rounded-lg shadow-lg px-3 py-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-white" />
                  <span className="text-xs font-medium text-white">AI Enhanced</span>
                </div>
              </motion.div>

              <div className="relative">
                {/* Glowing effect behind - animated */}
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.2, 0.3, 0.2],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur-3xl"
                ></motion.div>

                {/* Mock UI Preview with parallax */}
                <motion.div
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden backdrop-blur-sm bg-opacity-90"
                >
                  <SchemaEditorPreview />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Complete System Overview - Alternating Feature Blocks */}
      <section className="relative z-10 px-4 py-20 md:py-32">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              Complete{' '}
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Schema Automation
              </span>{' '}
              Platform
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              From schema creation to production code generation—all in one powerful workflow
            </p>
          </motion.div>

          {systemFeatures.map((feature, index) => (
            <SystemFeatureBlock key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="relative z-10 px-4 py-20 md:py-24 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              Everything You Need to Build Faster
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              Powerful features that automate your development workflow
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Horizontal Stepper */}
      <section className="relative z-10 px-4 py-20 md:py-32">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              How{' '}
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                FormSync
              </span>{' '}
              Works
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-300">
              Four simple steps from schema to production code
            </p>
          </motion.div>

          {/* Horizontal Process Flow */}
          <div className="relative">
            {/* Connecting Line */}
            <div
              className="absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-200 via-indigo-300 to-blue-200 dark:from-purple-900 dark:via-indigo-800 dark:to-blue-900 hidden md:block"
              style={{ left: '12.5%', right: '12.5%' }}
            ></div>

            <div className="grid md:grid-cols-4 gap-8 relative">
              {steps.map((step, index) => (
                <ProcessStep key={step.title} step={step} index={index} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Code Generation Outputs */}
      <section className="relative z-10 px-4 py-20 md:py-24 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              Complete{' '}
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Application
              </span>{' '}
              Generation
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              From one validated schema to a complete, production-ready codebase
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {outputs.map((output, index) => (
              <OutputCard key={output.title} output={output} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Enhanced Animation */}
      <section className="relative z-10 px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="relative border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-purple-950/20 dark:via-neutral-900 dark:to-blue-950/20 shadow-2xl overflow-hidden">
              {/* Animated background gradient */}
              <motion.div
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10"
                style={{ backgroundSize: '200% 200%' }}
              ></motion.div>

              {/* Glow border effect */}
              <motion.div
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 border-2 border-purple-400/50 rounded-lg blur-sm"
              ></motion.div>

              <CardContent className="p-12 md:p-16 text-center relative z-10">
                <motion.h2
                  initial={{ y: 10, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  className="text-3xl md:text-4xl font-bold mb-4 tracking-tight"
                >
                  Ready to Build Faster?
                </motion.h2>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-lg text-neutral-600 dark:text-neutral-300 mb-8 max-w-xl mx-auto"
                >
                  Join developers automating their workflow with FormSync
                </motion.p>
                <Link to="/editor">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      className="relative bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-2xl text-white px-12 py-6 text-lg font-semibold rounded-lg transition-all group overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center">
                        Start Creating
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </motion.div>
                      </span>
                      {/* Button glow */}
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-25 blur-xl transition-opacity"></div>
                    </Button>
                  </motion.div>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Schema Editor Preview Component
const SchemaEditorPreview = () => {
  return (
    <div className="p-6">
      {/* Mock Editor Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-xs text-neutral-500">user-registration.schema.json</span>
      </div>

      {/* AI Enhancement Label */}
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-3 w-3 text-purple-600" />
        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
          AI Enhanced Schema
        </span>
      </div>

      {/* Mock Code Content - Real AI Enhanced Schema */}
      <div className="font-mono text-xs space-y-1 text-neutral-700 dark:text-neutral-300 max-h-64 overflow-y-auto">
        <div>
          <span className="text-purple-600">{'{'}</span>
        </div>
        <div className="pl-4">
          <span className="text-blue-600">"$schema"</span>:{' '}
          <span className="text-green-600">"http://json-schema.org/draft-07/schema#"</span>,
        </div>
        <div className="pl-4">
          <span className="text-blue-600">"title"</span>:{' '}
          <span className="text-green-600">"User Registration"</span>,
        </div>
        <div className="pl-4">
          <span className="text-blue-600">"description"</span>:{' '}
          <span className="text-green-600">
            "Schema for user registration with comprehensive validation"
          </span>
          ,
        </div>
        <div className="pl-4">
          <span className="text-blue-600">"type"</span>:{' '}
          <span className="text-green-600">"object"</span>,
        </div>
        <div className="pl-4">
          <span className="text-blue-600">"required"</span>:{' '}
          <span className="text-yellow-600">["username", "email", "password"]</span>,
        </div>
        <div className="pl-4">
          <span className="text-blue-600">"properties"</span>:{' '}
          <span className="text-purple-600">{'{'}</span>
        </div>

        <div className="pl-8">
          <span className="text-blue-600">"username"</span>:{' '}
          <span className="text-purple-600">{'{'}</span>
        </div>
        <div className="pl-12">
          <span className="text-blue-600">"type"</span>:{' '}
          <span className="text-green-600">"string"</span>,
        </div>
        <div className="pl-12">
          <span className="text-blue-600">"description"</span>:{' '}
          <span className="text-green-600">"Unique username for the account"</span>,
        </div>
        <div className="bg-purple-50 dark:bg-purple-950/20 -ml-8 pl-12 pr-2 rounded">
          <span className="text-blue-600">"minLength"</span>:{' '}
          <span className="text-orange-600">3</span>,
        </div>
        <div className="bg-purple-50 dark:bg-purple-950/20 -ml-8 pl-12 pr-2 rounded">
          <span className="text-blue-600">"maxLength"</span>:{' '}
          <span className="text-orange-600">20</span>,
        </div>
        <div className="bg-purple-50 dark:bg-purple-950/20 -ml-8 pl-12 pr-2 rounded">
          <span className="text-blue-600">"pattern"</span>:{' '}
          <span className="text-green-600">"^[a-zA-Z0-9_-]+$"</span>,
        </div>
        <div className="pl-12">
          <span className="text-blue-600">"errorMessage"</span>:{' '}
          <span className="text-green-600">
            "Username must be 3-20 characters and contain only letters, numbers, underscores, or
            hyphens"
          </span>
        </div>
        <div className="pl-8">
          <span className="text-purple-600">{'},'}</span>
        </div>

        <div className="pl-8">
          <span className="text-blue-600">"email"</span>:{' '}
          <span className="text-purple-600">{'{'}</span>
        </div>
        <div className="pl-12">
          <span className="text-blue-600">"type"</span>:{' '}
          <span className="text-green-600">"string"</span>,
        </div>
        <div className="pl-12">
          <span className="text-blue-600">"description"</span>:{' '}
          <span className="text-green-600">"User's email address"</span>,
        </div>
        <div className="pl-12">
          <span className="text-blue-600">"format"</span>:{' '}
          <span className="text-green-600">"email"</span>,
        </div>
        <div className="bg-purple-50 dark:bg-purple-950/20 -ml-8 pl-12 pr-2 rounded">
          <span className="text-blue-600">"pattern"</span>:{' '}
          <span className="text-green-600">
            "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{`{2,}`}$"
          </span>
          ,
        </div>
        <div className="pl-12">
          <span className="text-blue-600">"errorMessage"</span>:{' '}
          <span className="text-green-600">"Please provide a valid email address"</span>
        </div>
        <div className="pl-8">
          <span className="text-purple-600">{'},'}</span>
        </div>

        <div className="pl-8">
          <span className="text-blue-600">"password"</span>:{' '}
          <span className="text-purple-600">{'{'}</span>
        </div>
        <div className="pl-12">
          <span className="text-blue-600">"type"</span>:{' '}
          <span className="text-green-600">"string"</span>,
        </div>
        <div className="pl-12">
          <span className="text-blue-600">"description"</span>:{' '}
          <span className="text-green-600">"Secure password meeting complexity requirements"</span>,
        </div>
        <div className="bg-purple-50 dark:bg-purple-950/20 -ml-8 pl-12 pr-2 rounded">
          <span className="text-blue-600">"minLength"</span>:{' '}
          <span className="text-orange-600">8</span>,
        </div>
        <div className="bg-purple-50 dark:bg-purple-950/20 -ml-8 pl-12 pr-2 rounded">
          <span className="text-blue-600">"maxLength"</span>:{' '}
          <span className="text-orange-600">128</span>,
        </div>
        <div className="bg-purple-50 dark:bg-purple-950/20 -ml-8 pl-12 pr-2 rounded">
          <span className="text-blue-600">"pattern"</span>:{' '}
          <span className="text-green-600">
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]"
          </span>
          ,
        </div>
        <div className="pl-12">
          <span className="text-blue-600">"errorMessage"</span>:{' '}
          <span className="text-green-600">
            "Password must contain uppercase, lowercase, number, and special character"
          </span>
        </div>
        <div className="pl-8">
          <span className="text-purple-600">{'}'}</span>
        </div>

        <div className="pl-4">
          <span className="text-purple-600">{'}'}</span>
        </div>
        <div>
          <span className="text-purple-600">{'}'}</span>
        </div>
      </div>

      {/* AI Enhancement Highlights */}
      <div className="mt-4 flex flex-wrap gap-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
          <Sparkles className="h-3 w-3 text-purple-600" />
          <span className="text-xs font-medium text-purple-700 dark:text-purple-400">
            +6 Validations
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
          <Check className="h-3 w-3 text-green-600" />
          <span className="text-xs font-medium text-green-700 dark:text-green-400">
            Error Messages
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
          <FileCode className="h-3 w-3 text-blue-600" />
          <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Descriptions</span>
        </div>
      </div>
    </div>
  );
};

// Feature Card Component (Enhanced with Glassmorphism)
const FeatureCard = ({ feature, index }: { feature: any; index: number }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
    whileHover={{ y: -8, transition: { duration: 0.2, ease: 'easeOut' } }}
  >
    <Card className="h-full border border-neutral-200 dark:border-neutral-800 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm relative overflow-hidden group">
      {/* Animated border glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <CardContent className="p-6 relative z-10">
        <motion.div
          whileHover={{ rotate: 5, scale: 1.05 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-950/50 dark:to-indigo-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4"
        >
          {feature.icon}
        </motion.div>
        <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {feature.description}
        </p>
      </CardContent>
    </Card>
  </motion.div>
);

// System Feature Block Component (Alternating Layout)
const SystemFeatureBlock = ({ feature, index }: { feature: any; index: number }) => {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={`grid md:grid-cols-2 gap-12 items-center mb-32 last:mb-0 ${!isEven ? 'md:grid-flow-dense' : ''}`}
    >
      {/* Content */}
      <div className={isEven ? '' : 'md:col-start-2'}>
        <motion.div
          initial={{ x: isEven ? -20 : 20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/30 mb-4">
            {feature.icon}
            <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
              {feature.badge}
            </span>
          </div>
          <h3 className="text-3xl md:text-4xl font-bold mb-4">{feature.title}</h3>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-6 leading-relaxed">
            {feature.description}
          </p>
          <ul className="space-y-3">
            {feature.points.map((point: string, i: number) => (
              <motion.li
                key={i}
                initial={{ x: -10, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-neutral-700 dark:text-neutral-300">{point}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Visual */}
      <div className={isEven ? '' : 'md:col-start-1'}>
        <motion.div
          initial={{ x: isEven ? 20 : -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -5, transition: { duration: 0.2, ease: 'easeOut' } }}
          className="relative"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl blur-2xl opacity-20"></div>

          <div className="relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-2xl">
            {feature.visual}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Process Step Component (Enhanced with glow and hover effects)
const ProcessStep = ({ step, index }: { step: any; index: number }) => (
  <motion.div
    initial={{ y: 30, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.15, duration: 0.5 }}
    whileHover={{ y: -5, scale: 1.05, transition: { duration: 0.2, ease: 'easeOut' } }}
    className="flex flex-col items-center text-center relative group cursor-pointer"
  >
    {/* Step Number Circle with animated glow */}
    <motion.div
      whileHover={{
        boxShadow: '0 0 30px rgba(147, 51, 234, 0.5)',
        scale: 1.1,
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-lg relative z-10 transition-all duration-300"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-50 blur-xl"
      ></motion.div>
      <span className="relative z-10">{index + 1}</span>
    </motion.div>

    {/* Content */}
    <div className="relative">
      <div className="absolute -inset-4 bg-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
      <div className="relative">
        <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors">
          {step.title}
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{step.description}</p>
      </div>
    </div>
  </motion.div>
);

// Output Card Component (Enhanced)
const OutputCard = ({ output, index }: { output: any; index: number }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
    whileHover={{ y: -8, transition: { duration: 0.2, ease: 'easeOut' } }}
  >
    <Card className="h-full border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-neutral-900">
      <CardContent className="p-6">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white mb-4">
          {output.icon}
        </div>
        <h3 className="text-lg font-bold mb-2">{output.title}</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">{output.description}</p>
        <ul className="space-y-2">
          {output.features.map((feature: string) => (
            <li
              key={feature}
              className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400"
            >
              <Check className="h-3 w-3 text-green-600 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  </motion.div>
);

// Features Data
const features = [
  {
    icon: <FileJson className="h-6 w-6" />,
    title: 'Multi-Format Support',
    description:
      'Import and validate JSON, YAML, or XML schemas. Convert between formats seamlessly.',
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: 'AI Enhancement',
    description:
      'GPT-4 powered suggestions for validation rules, accessibility, and structure improvements.',
  },
  {
    icon: <Workflow className="h-6 w-6" />,
    title: 'Dual Workflow Modes',
    description:
      'Choose manual step-by-step control or automated one-click pipeline for maximum flexibility.',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Quality Assurance',
    description:
      'Automated validation with quality scoring and detailed suggestions for production readiness.',
  },
];

// System Features Data (for alternating blocks)
const systemFeatures = [
  {
    badge: 'Schema Creation',
    title: 'Build Schemas Visually or with Code',
    description:
      'Create JSON schemas using our drag-and-drop template builder or write directly in the technical editor with real-time validation.',
    icon: <Layout className="h-4 w-4 text-purple-600" />,
    points: [
      'Visual template builder with pre-built components',
      'Monaco-powered code editor with IntelliSense',
      'Real-time syntax validation and error detection',
      'Import from JSON, YAML, or XML formats',
    ],
    visual: (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <Layout className="h-8 w-8 text-purple-600" />
          <div>
            <div className="font-semibold text-sm">Template Builder</div>
            <div className="text-xs text-neutral-500">Drag & drop components</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <Code2 className="h-8 w-8 text-indigo-600" />
          <div>
            <div className="font-semibold text-sm">Technical Editor</div>
            <div className="text-xs text-neutral-500">Write code directly</div>
          </div>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              Schema Ready
            </span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Valid JSON Schema Draft-7
          </p>
        </div>
      </div>
    ),
  },
  {
    badge: 'Validation Engine',
    title: 'Intelligent Syntax Validation & Quick Fix',
    description:
      'Advanced validation engine detects errors in real-time and offers AI-powered auto-fix suggestions to resolve issues instantly.',
    icon: <Shield className="h-4 w-4 text-purple-600" />,
    points: [
      'Multi-format syntax validation (JSON, YAML, XML)',
      'AI-powered quick fix for common errors',
      'Detailed error messages with line numbers',
      'Format mismatch detection and suggestions',
    ],
    visual: (
      <div className="space-y-3">
        <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-700 dark:text-red-400">
              Syntax Error Detected
            </span>
          </div>
          <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">
            Line 12: Missing closing brace
          </p>
        </div>
        <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <Button
            size="sm"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            AI Quick Fix
          </Button>
        </motion.div>
        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              Fixed Successfully
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    badge: 'AI Enhancement',
    title: 'GPT-4 Powered Schema Enhancement',
    description:
      'Leverage advanced AI to automatically improve your schema with validation rules, accessibility features, and structural optimizations.',
    icon: <Sparkles className="h-4 w-4 text-purple-600" />,
    points: [
      'AI-generated validation rules and constraints',
      'Accessibility improvements (titles, descriptions)',
      'Structure optimization suggestions',
      'Quality scoring with detailed breakdown',
    ],
    visual: (
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
          <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
            AI Enhancing...
          </span>
        </div>
        <div className="space-y-2">
          <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
            Quality Score
          </div>
          <div className="flex gap-2">
            {[85, 92, 78, 95, 88].map((score, i) => (
              <motion.div
                key={i}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex-1 bg-gradient-to-t from-purple-600 to-indigo-600 rounded-t"
                style={{ height: `${score}px` }}
              ></motion.div>
            ))}
          </div>
        </div>
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">+ 12 suggestions applied</p>
        </div>
      </div>
    ),
  },
  {
    badge: 'Code Generation',
    title: 'Full-Stack Code Generation',
    description:
      'Generate production-ready frontend forms, backend APIs, DTOs, and test cases from your validated schema—all in one click.',
    icon: <Terminal className="h-4 w-4 text-purple-600" />,
    points: [
      'React form components with validation',
      'Express/NestJS backend controllers',
      'TypeScript DTOs with decorators',
      'Complete test suites (unit + integration)',
    ],
    visual: (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Code2, label: 'Forms', color: 'blue' },
            { icon: Server, label: 'API', color: 'green' },
            { icon: Database, label: 'DTOs', color: 'purple' },
            { icon: TestTube, label: 'Tests', color: 'orange' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`p-3 bg-${item.color}-50 dark:bg-${item.color}-950/20 rounded-lg border border-${item.color}-200 dark:border-${item.color}-800 flex flex-col items-center`}
            >
              <item.icon className={`h-6 w-6 text-${item.color}-600 mb-1`} />
              <span className="text-xs font-medium">{item.label}</span>
            </motion.div>
          ))}
        </div>
        <Button
          size="sm"
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
        >
          <Package className="h-4 w-4 mr-2" />
          Download All Code
        </Button>
      </div>
    ),
  },
];

// Steps Data
const steps = [
  {
    title: 'Validate',
    description: 'Check syntax and structure of your schema',
  },
  {
    title: 'Convert',
    description: 'Transform to JSON Schema Draft-7 format',
  },
  {
    title: 'Enhance',
    description: 'Apply AI-powered improvements and suggestions',
  },
  {
    title: 'Generate',
    description: 'Create full-stack code automatically',
  },
];

// Outputs Data
const outputs = [
  {
    icon: <Code2 className="h-7 w-7" />,
    title: 'Frontend Forms',
    description: 'Dynamic React components with validation',
    features: ['Form UI Components', 'Client Validation', 'State Management'],
  },
  {
    icon: <Server className="h-7 w-7" />,
    title: 'Backend API',
    description: 'REST endpoints with Express/NestJS',
    features: ['Controllers & Routes', 'Request Handlers', 'Error Middleware'],
  },
  {
    icon: <Database className="h-7 w-7" />,
    title: 'DTOs & Types',
    description: 'TypeScript interfaces and validation',
    features: ['Type Definitions', 'Class Validators', 'Transform Decorators'],
  },
  {
    icon: <TestTube className="h-7 w-7" />,
    title: 'Test Suites',
    description: 'Automated test cases',
    features: ['Unit Tests', 'Integration Tests', 'Full Coverage'],
  },
];

// Animation Styles
const style = document.createElement('style');
style.textContent = `
  @keyframes blob {
    0%, 100% { 
      transform: translate(0, 0) scale(1); 
      opacity: 0.7;
    }
    33% { 
      transform: translate(30px, -50px) scale(1.1); 
      opacity: 0.8;
    }
    66% { 
      transform: translate(-20px, 30px) scale(0.9); 
      opacity: 0.6;
    }
  }
  
  .animate-blob {
    animation: blob 8s infinite ease-in-out;
  }
  
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  
  .animation-delay-4000 {
    animation-delay: 4s;
  }
`;
document.head.appendChild(style);
