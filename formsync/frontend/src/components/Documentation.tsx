import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, Copy, Check, Info, AlertTriangle } from 'lucide-react';
import { Footer } from './layout/Footer';

interface TocItem {
  id: string;
  title: string;
  level: number;
}

export const Documentation: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['getting-started', 'using-formsync', 'ai-features', 'validation', 'export', 'components', 'help']));
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const isNavigatingRef = useRef(false);

  // Auto-detect active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      // Skip auto-detection during manual navigation
      if (isNavigatingRef.current) return;
      
      const sections = document.querySelectorAll('section[id]');
      let currentSection = 'overview';
      
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          currentSection = section.id;
        }
      });
      
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Generate TOC from headings
  useEffect(() => {
    const headings = document.querySelectorAll('main h2, main h3');
    const items: TocItem[] = [];
    
    headings.forEach((heading) => {
      if (heading.id) {
        items.push({
          id: heading.id,
          title: heading.textContent || '',
          level: heading.tagName === 'H2' ? 2 : 3
        });
      }
    });
    
    setTocItems(items);
  }, []);

  const scrollToSection = (id: string) => {
    // Disable auto-detection during navigation
    isNavigatingRef.current = true;
    setActiveSection(id);
    
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Re-enable auto-detection after scroll completes
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 1000);
    } else {
      isNavigatingRef.current = false;
    }
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) return;

    // Search through all sections
    const sections = document.querySelectorAll('section[id]');
    const matches: Array<{ id: string; title: string; score: number }> = [];
    
    sections.forEach((section) => {
      const title = section.querySelector('h2, h3')?.textContent || '';
      const content = section.textContent || '';
      const id = section.id;
      
      // Calculate relevance score
      let score = 0;
      if (title.toLowerCase().includes(query.toLowerCase())) score += 10;
      if (content.toLowerCase().includes(query.toLowerCase())) score += 1;
      
      if (score > 0) {
        matches.push({ id, title, score });
      }
    });

    // Sort by relevance and navigate to best match
    if (matches.length > 0) {
      matches.sort((a, b) => b.score - a.score);
      scrollToSection(matches[0].id);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-neutral-50 via-white to-purple-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950/10">
      <div className="flex flex-1">
        {/* Left Sidebar Navigation */}
        <motion.aside 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-72 border-r border-neutral-200 dark:border-neutral-800 sticky top-0 h-screen overflow-y-auto bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl"
        >
        <div className="p-6">
          {/* Logo/Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              FormSync Docs
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Complete documentation reference</p>
          </div>

          {/* Search Bar */}
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchQuery);
                }
              }}
              className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                ×
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-6">
            <NavSection 
              title="GETTING STARTED" 
              groupId="getting-started"
              expanded={expandedGroups.has('getting-started')}
              onToggle={() => toggleGroup('getting-started')}
            >
              <NavItem id="overview" active={activeSection} onClick={scrollToSection} searchQuery={searchQuery}>Overview</NavItem>
              <NavItem id="architecture" active={activeSection} onClick={scrollToSection} searchQuery={searchQuery}>System Architecture</NavItem>
              <NavItem id="user-types" active={activeSection} onClick={scrollToSection} searchQuery={searchQuery}>Supported User Types</NavItem>
            </NavSection>

            <NavSection 
              title="USING FORMSYNC" 
              groupId="using-formsync"
              expanded={expandedGroups.has('using-formsync')}
              onToggle={() => toggleGroup('using-formsync')}
            >
              <NavItem id="templates" active={activeSection} onClick={scrollToSection} searchQuery={searchQuery}>Creating Forms with Templates</NavItem>
              <NavItem id="schema-editor" active={activeSection} onClick={scrollToSection} searchQuery={searchQuery}>Schema Editor Overview</NavItem>
              <NavItem id="formats" active={activeSection} onClick={scrollToSection} searchQuery={searchQuery}>Multiple Input Formats</NavItem>
            </NavSection>

            <NavSection 
              title="AI-ASSISTED FEATURES" 
              groupId="ai-features"
              expanded={expandedGroups.has('ai-features')}
              onToggle={() => toggleGroup('ai-features')}
            >
              <NavItem id="ai-suggestions" active={activeSection} onClick={scrollToSection} searchQuery={searchQuery}>AI Schema Suggestions</NavItem>
              <NavItem id="apply-undo" active={activeSection} onClick={scrollToSection} searchQuery={searchQuery}>Applying and Undoing</NavItem>
              <NavItem id="quality-scoring" active={activeSection} onClick={scrollToSection} searchQuery={searchQuery}>Schema Quality Scoring</NavItem>
            </NavSection>

            <NavSection 
              title="VALIDATION & OPTIMIZATION" 
              groupId="validation"
              expanded={expandedGroups.has('validation')}
              onToggle={() => toggleGroup('validation')}
            >
              <NavItem id="validation" active={activeSection} onClick={scrollToSection} searchQuery={searchQuery}>Validation Process</NavItem>
              <NavItem id="errors" active={activeSection} onClick={scrollToSection} searchQuery={searchQuery}>Error Detection & Handling</NavItem>
              <NavItem id="best-practices" active={activeSection} onClick={scrollToSection} searchQuery={searchQuery}>Best Practices</NavItem>
            </NavSection>

            <NavSection 
              title="EXPORT & INTEGRATION" 
              groupId="export"
              expanded={expandedGroups.has('export')}
              onToggle={() => toggleGroup('export')}
            >
              <NavItem id="export" active={activeSection} onClick={scrollToSection} searchQuery={searchQuery}>Exporting Schemas</NavItem>
              <NavItem id="integration" active={activeSection} onClick={scrollToSection} searchQuery={searchQuery}>External Systems</NavItem>
            </NavSection>

            <NavSection 
              title="COMPONENTS" 
              groupId="components"
              expanded={expandedGroups.has('components')}
              onToggle={() => toggleGroup('components')}
            >
              <NavItem id="comp-templates" active={activeSection} onClick={scrollToSection} searchQuery={searchQuery}>Template Builder</NavItem>
              <NavItem id="comp-editor" active={activeSection} onClick={scrollToSection} searchQuery={searchQuery}>Schema Editor</NavItem>
              <NavItem id="comp-ai" active={activeSection} onClick={scrollToSection} searchQuery={searchQuery}>AI Enhancement Engine</NavItem>
              <NavItem id="comp-quality" active={activeSection} onClick={scrollToSection} searchQuery={searchQuery}>Quality Evaluation</NavItem>
            </NavSection>

            <NavSection 
              title="HELP & REFERENCE" 
              groupId="help"
              expanded={expandedGroups.has('help')}
              onToggle={() => toggleGroup('help')}
            >
              <NavItem id="faqs" active={activeSection} onClick={scrollToSection} searchQuery={searchQuery}>FAQs</NavItem>
              <NavItem id="common-errors" active={activeSection} onClick={scrollToSection} searchQuery={searchQuery}>Common Errors</NavItem>
              <NavItem id="limitations" active={activeSection} onClick={scrollToSection} searchQuery={searchQuery}>Limitations</NavItem>
              <NavItem id="support" active={activeSection} onClick={scrollToSection} searchQuery={searchQuery}>Support</NavItem>
            </NavSection>
          </nav>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 px-8 lg:px-16 py-12 max-w-4xl">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 tracking-tight">
            FormSync Documentation
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-12 leading-relaxed">
            Complete guide to building, validating, and optimizing form schemas with AI assistance.
          </p>

          <Section id="overview" title="Overview">
            <p className="text-neutral-700 dark:text-neutral-300 mb-4 leading-relaxed">
              FormSync is a web-based platform that helps you create, validate, and optimize form schemas with AI assistance. 
              The system supports multiple input formats and provides real-time quality scoring to ensure your forms meet 
              enterprise standards.
            </p>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              Whether you're a non-technical user starting with templates or a developer building custom schemas, 
              FormSync streamlines the entire form creation workflow with intelligent suggestions and automated validation.
            </p>
          </Section>

          <Section id="architecture" title="System Architecture">
            <p className="text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed">
              FormSync consists of four core components working together:
            </p>
            <div className="grid gap-4">
              <Feature title="Template-Based Form Builder" description="Rapid prototyping with pre-built templates" />
              <Feature title="Schema Editor" description="Multi-format support with syntax highlighting" />
              <Feature title="AI Enhancement Engine" description="Intelligent suggestions for validation and accessibility" />
              <Feature title="Quality Evaluation Engine" description="Continuous assessment across five dimensions" />
            </div>
          </Section>

          <Section id="user-types" title="Supported User Types">
            <div className="space-y-6">
              <UserType 
                type="Non-Technical Users" 
                description="Start with pre-built templates, customize through a visual interface, and leverage AI suggestions without writing code."
              />
              <UserType 
                type="Technical Users" 
                description="Create schemas from scratch, work directly with JSON/YAML/XML, and integrate with external systems."
              />
            </div>
          </Section>

          <Section id="templates" title="Creating Forms with Templates">
            <p className="text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed">
              Templates provide a quick start for common form types:
            </p>
            <StepList steps={[
              'Click the Templates button in the editor',
              'Select a template that matches your use case',
              'The template loads automatically into the editor',
              'Customize fields as needed',
              'Run AI Enhancement for additional improvements'
            ]} />
          </Section>

          <Section id="schema-editor" title="Schema Editor Overview">
            <p className="text-neutral-700 dark:text-neutral-300 mb-4 leading-relaxed">
              The Schema Editor provides a code-based interface for creating and modifying form structures. 
              It supports syntax highlighting, real-time validation, and format conversion.
            </p>
            <Callout type="info" title="Pro Tip">
              Technical users can write schemas directly while seeing immediate feedback on structure and validity.
            </Callout>
          </Section>

          <Section id="formats" title="Multiple Input Formats">
            <p className="text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed">
              FormSync supports three input formats:
            </p>
            <div className="space-y-4">
              <FormatCard format="JSON" description="Standard format for web applications" />
              <FormatCard format="YAML" description="Human-readable format with minimal syntax" />
              <FormatCard format="XML" description="Traditional enterprise format" />
            </div>
            <p className="text-neutral-700 dark:text-neutral-300 mt-6 leading-relaxed">
              All formats are converted to a standardized internal representation for processing.
            </p>
          </Section>

          <Section id="ai-suggestions" title="AI Schema Suggestions">
            <p className="text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed">
              The AI Enhancement Engine analyzes your schema and generates targeted suggestions for:
            </p>
            <FeatureList items={[
              'Validation rules (email patterns, password requirements)',
              'Accessibility improvements (labels, descriptions)',
              'Consistency fixes (naming conventions, field types)'
            ]} />
            <Callout type="warning" title="Important">
              All suggestions are optional and require explicit user approval before application.
            </Callout>
          </Section>

          <Section id="apply-undo" title="Applying and Undoing Suggestions">
            <p className="text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed">
              Each suggestion can be individually applied or undone:
            </p>
            <FeatureList items={[
              'Click Apply to accept a suggestion',
              'The schema updates immediately',
              'Quality score recalculates in real-time',
              'Click Undo to reverse any applied suggestion',
              'Use Apply All or Undo All for batch operations'
            ]} />
          </Section>

          <Section id="quality-scoring" title="Schema Quality Scoring">
            <p className="text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed">
              Schemas receive a quality score from 0 to 100 based on five dimensions:
            </p>
            <div className="space-y-3">
              <ScoreDimension name="Structure" weight="25%" description="Schema organization and validity" />
              <ScoreDimension name="Validation" weight="25%" description="Coverage of validation rules" />
              <ScoreDimension name="Accessibility" weight="20%" description="Labels, hints, and screen reader support" />
              <ScoreDimension name="Consistency" weight="20%" description="Naming conventions and field types" />
              <ScoreDimension name="AI Improvement" weight="10%" description="AI enhancement depth" />
            </div>
          </Section>

          <Section id="validation" title="Schema Validation Process">
            <p className="text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed">
              Validation occurs in three stages:
            </p>
            <StepList steps={[
              'Format validation (JSON/YAML/XML syntax)',
              'Structure validation (required properties, types)',
              'Semantic validation (field relationships, constraints)'
            ]} />
            <p className="text-neutral-700 dark:text-neutral-300 mt-6 leading-relaxed">
              Errors are displayed with line numbers and specific guidance for resolution.
            </p>
          </Section>

          <Section id="errors" title="Error Detection & Handling">
            <p className="text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed">
              Common errors and resolutions:
            </p>
            <CodeBlock 
              language="json"
              code={`// Common Error: Missing required property
{
  "type": "object"
  // Missing "properties" field
}

// Solution: Add required properties
{
  "type": "object",
  "properties": {
    // Your properties here
  }
}`}
            copyCode={copyCode}
            copiedCode={copiedCode}
            />
            <div className="mt-6 space-y-4">
              <ErrorSolution error="Syntax errors" solution="Check for missing commas or quotes" />
              <ErrorSolution error="Type mismatches" solution="Ensure field types are valid" />
              <ErrorSolution error="Missing properties" solution="Add required schema properties" />
            </div>
          </Section>

          <Section id="best-practices" title="Best Practices for High-Quality Schemas">
            <FeatureList items={[
              'Start with templates when possible',
              'Run validation before AI enhancement',
              'Apply accessibility suggestions for public-facing forms',
              'Use consistent naming conventions',
              'Target a quality score above 80'
            ]} />
            <Callout type="info" title="Quality Target">
              Aim for a quality score of 80 or higher. Scores above 85 indicate excellent schema quality.
            </Callout>
          </Section>

          <Section id="export" title="Exporting Schemas">
            <p className="text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed">
              Enhanced schemas can be copied from the output panel and used directly in your application. 
              The schema follows JSON Schema standards and is compatible with most form libraries.
            </p>
            <CodeBlock
              language="json"
              filename="user-form.schema.json"
              code={`{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["email", "password"],
  "properties": {
    "email": {
      "type": "string",
      "format": "email",
      "description": "User's email address"
    },
    "password": {
      "type": "string",
      "minLength": 8,
      "pattern": "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\\\d)"
    }
  }
}`}
              copyCode={copyCode}
              copiedCode={copiedCode}
            />
          </Section>

          <Section id="integration" title="Using Schemas in External Systems">
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              FormSync schemas work with form validation libraries, API validators, and database schema tools. 
              Export the final JSON and integrate it into your development workflow.
            </p>
          </Section>

          <Section id="comp-templates" title="Component: Template-Based Form Builder">
            <p className="text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed">
              The Template Builder enables rapid form creation without coding:
            </p>
            <FeatureList items={[
              'Pre-configured form types (Contact, Registration, Survey, Feedback)',
              'One-click loading into the editor',
              'Customizable fields and validation',
              'Automatic AI enhancement compatibility'
            ]} />
          </Section>

          <Section id="comp-editor" title="Component: Schema Editor">
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              A code editor with syntax highlighting, validation feedback, and multi-format support. 
              Suitable for technical users who prefer direct schema manipulation.
            </p>
          </Section>

          <Section id="comp-ai" title="Component: AI Enhancement Engine">
            <p className="text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed">
              AI analyzes schema structure and generates suggestions for:
            </p>
            <FeatureList items={[
              'Missing validation rules',
              'Accessibility improvements',
              'Naming consistency'
            ]} />
            <Callout type="info" title="Human-in-the-Loop Design">
              All suggestions require user approval, maintaining full control over schema changes.
            </Callout>
          </Section>

          <Section id="comp-quality" title="Component: Schema Quality Evaluation">
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              Real-time quality scoring across five dimensions. Scores update dynamically as suggestions are applied or undone, 
              providing immediate feedback on schema improvements.
            </p>
          </Section>

          <Section id="faqs" title="Frequently Asked Questions">
            <div className="space-y-6">
              <FAQ 
                question="Do I need coding knowledge?" 
                answer="No. Non-technical users can start with templates and use AI assistance without writing code." 
              />
              <FAQ 
                question="What quality score should I target?" 
                answer="Aim for 80 or higher. Scores above 85 indicate excellent quality." 
              />
              <FAQ 
                question="Can I undo AI changes?" 
                answer="Yes. Every suggestion can be individually undone at any time." 
              />
              <FAQ 
                question="Are schemas saved automatically?" 
                answer="No. Export and save schemas locally or copy them to your application." 
              />
            </div>
          </Section>

          <Section id="common-errors" title="Common Errors">
            <div className="space-y-4">
              <ErrorSolution 
                error="Invalid JSON" 
                solution="Check syntax (commas, brackets, quotes)" 
              />
              <ErrorSolution 
                error="Low quality score" 
                solution="Apply AI suggestions for validation and accessibility" 
              />
              <ErrorSolution 
                error="Validation failed" 
                solution="Ensure required properties are present" 
              />
            </div>
          </Section>

          <Section id="limitations" title="Limitations">
            <FeatureList items={[
              'AI enhancement requires internet connection',
              'Complex nested schemas may need manual refinement',
              'No automatic schema versioning'
            ]} />
          </Section>

          <Section id="support" title="Support">
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-6">
              For technical support, bug reports, or feature requests, contact your system administrator.
            </p>
            <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
              <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Need Help?</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Visit our support portal or reach out to our team for assistance with FormSync.
              </p>
            </div>
          </Section>
        </motion.div>
      </main>

      {/* Right TOC Sidebar */}
      <aside className="hidden xl:block w-64 sticky top-0 h-screen overflow-y-auto border-l border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
        <div className="p-6">
          <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
            On This Page
          </h3>
          <nav className="space-y-2">
            {tocItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`block w-full text-left text-sm transition-all ${
                  item.level === 3 ? 'pl-4' : ''
                } ${
                  activeSection === item.id
                    ? 'text-purple-600 dark:text-purple-400 font-medium'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15 }}
              >
                {activeSection === item.id && (
                  <motion.span
                    layoutId="activeTocIndicator"
                    className="absolute left-0 w-0.5 h-4 bg-purple-600 dark:bg-purple-400"
                  />
                )}
                {item.title}
              </motion.button>
            ))}
          </nav>
        </div>
      </aside>
      </div>
      <Footer />
    </div>
  );
};

// ========================================
// Component Definitions
// ========================================

// Navigation Section with Collapse
const NavSection: React.FC<{ 
  title: string; 
  groupId: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode 
}> = ({ title, groupId: _groupId, expanded, onToggle, children }) => (
  <div className="mb-4">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
    >
      {title}
      <motion.div
        animate={{ rotate: expanded ? 90 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronRight className="h-3 w-3" />
      </motion.div>
    </button>
    <AnimatePresence>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-1 overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// Navigation Item
const NavItem: React.FC<{ 
  id: string; 
  active: string; 
  onClick: (id: string) => void; 
  children: React.ReactNode;
  searchQuery?: string;
}> = ({ id, active, onClick, children, searchQuery }) => {
  // Check if this item matches the search query
  const text = typeof children === 'string' ? children : '';
  const isMatch = searchQuery && text.toLowerCase().includes(searchQuery.toLowerCase());
  
  // Highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-500/30 text-neutral-900 dark:text-neutral-100">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <motion.button
      onClick={() => onClick(id)}
      whileHover={{ x: 2 }}
      transition={{ duration: 0.15 }}
      className={`relative w-full text-left px-3 py-2 rounded text-sm transition-all ${
        active === id
          ? 'bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 font-medium'
          : isMatch
          ? 'bg-yellow-50 dark:bg-yellow-900/20 text-neutral-900 dark:text-neutral-100'
          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
      }`}
    >
      {active === id && (
        <motion.div
          layoutId="activeNav"
          className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600 dark:bg-purple-400 rounded-r"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      <span className={active === id ? 'ml-1' : ''}>
        {searchQuery && typeof children === 'string' ? highlightText(children, searchQuery) : children}
      </span>
    </motion.button>
  );
};

// Main Section Component
const Section: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
  <motion.section 
    id={id} 
    className="mb-16 scroll-mt-24"
    initial={{ y: 20, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 pb-3 border-b border-neutral-200 dark:border-neutral-800">
      {title}
    </h2>
    <div className="space-y-6">{children}</div>
  </motion.section>
);

// Feature Box
const Feature: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <motion.div
    whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
    className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all bg-white dark:bg-neutral-900"
  >
    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{title}</h4>
    <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
  </motion.div>
);

// User Type Card
const UserType: React.FC<{ type: string; description: string }> = ({ type, description }) => (
  <div className="p-5 border-l-4 border-purple-600 bg-purple-50/50 dark:bg-purple-950/10 rounded-r-lg">
    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{type}</h4>
    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">{description}</p>
  </div>
);

// Step List (Numbered)
const StepList: React.FC<{ steps: string[] }> = ({ steps }) => (
  <ol className="space-y-3">
    {steps.map((step, index) => (
      <motion.li
        key={index}
        initial={{ x: -10, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        className="flex items-start gap-3"
      >
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white text-sm font-semibold flex items-center justify-center">
          {index + 1}
        </span>
        <span className="text-neutral-700 dark:text-neutral-300 pt-0.5">{step}</span>
      </motion.li>
    ))}
  </ol>
);

// Feature List (Checkmarks)
const FeatureList: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className="space-y-3">
    {items.map((item, index) => (
      <motion.li
        key={index}
        initial={{ x: -10, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        className="flex items-start gap-3"
      >
        <Check className="h-5 w-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
        <span className="text-neutral-700 dark:text-neutral-300">{item}</span>
      </motion.li>
    ))}
  </ul>
);

// Callout Box
const Callout: React.FC<{ type: 'info' | 'warning'; title: string; children: React.ReactNode }> = ({ type, title, children }) => {
  const styles = {
    info: {
      border: 'border-blue-200 dark:border-blue-800',
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      icon: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      title: 'text-blue-900 dark:text-blue-100',
      content: 'text-blue-800 dark:text-blue-200'
    },
    warning: {
      border: 'border-amber-200 dark:border-amber-800',
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      icon: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
      title: 'text-amber-900 dark:text-amber-100',
      content: 'text-amber-800 dark:text-amber-200'
    }
  };

  const style = styles[type];

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      className={`${style.border} ${style.bg} border rounded-lg p-4 my-6`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{style.icon}</div>
        <div>
          <h4 className={`font-semibold ${style.title} mb-1`}>{title}</h4>
          <div className={`text-sm ${style.content}`}>{children}</div>
        </div>
      </div>
    </motion.div>
  );
};

// Code Block with Copy Button
const CodeBlock: React.FC<{ 
  language: string; 
  code: string; 
  filename?: string;
  copyCode: (code: string) => void;
  copiedCode: string | null;
}> = ({ language: _language, code, filename, copyCode, copiedCode }) => {
  const isCopied = copiedCode === code;

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      className="relative my-6 group"
    >
      {filename && (
        <div className="px-4 py-2 bg-neutral-800 dark:bg-neutral-900 border-b border-neutral-700 rounded-t-lg text-xs text-neutral-400 font-mono">
          {filename}
        </div>
      )}
      <div className={`relative bg-neutral-900 dark:bg-neutral-950 ${filename ? '' : 'rounded-t-lg'} rounded-b-lg overflow-hidden`}>
        <button
          onClick={() => copyCode(code)}
          className="absolute top-3 right-3 p-2 bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors opacity-0 group-hover:opacity-100"
        >
          {isCopied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 text-neutral-400" />
          )}
        </button>
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-neutral-100 font-mono">{code}</code>
        </pre>
      </div>
    </motion.div>
  );
};

// Format Card
const FormatCard: React.FC<{ format: string; description: string }> = ({ format, description }) => (
  <motion.div
    whileHover={{ x: 4, transition: { duration: 0.2 } }}
    className="flex items-start gap-4 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:border-purple-300 dark:hover:border-purple-700 transition-all"
  >
    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center">
      <span className="text-sm font-bold text-purple-700 dark:text-purple-300">{format}</span>
    </div>
    <div>
      <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{format}</h4>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
    </div>
  </motion.div>
);

// Score Dimension
const ScoreDimension: React.FC<{ name: string; weight: string; description: string }> = ({ name, weight, description }) => (
  <motion.div
    whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
    className="flex justify-between items-start p-4 bg-gradient-to-r from-neutral-50 to-purple-50/20 dark:from-neutral-900 dark:to-purple-950/10 border border-neutral-200 dark:border-neutral-800 rounded-lg"
  >
    <div className="flex-1">
      <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{name}</h4>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
    </div>
    <span className="ml-4 px-3 py-1 bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-sm font-semibold rounded-full">
      {weight}
    </span>
  </motion.div>
);

// FAQ Item
const FAQ: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors text-left"
      >
        <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 pr-4">{question}</h4>
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronRight className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Error Solution
const ErrorSolution: React.FC<{ error: string; solution: string }> = ({ error, solution }) => (
  <motion.div
    initial={{ x: -10, opacity: 0 }}
    whileInView={{ x: 0, opacity: 1 }}
    viewport={{ once: true }}
    className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900 rounded-lg"
  >
    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
    <div>
      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">{error}</h4>
      <p className="text-sm text-red-800 dark:text-red-200">{solution}</p>
    </div>
  </motion.div>
);

