import React, { useState } from 'react';

export const Documentation: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed Sidebar Navigation */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto fixed h-screen left-0 top-0">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Documentation</h2>
          
          <nav className="space-y-6">
            <NavSection title="Getting Started">
              <NavItem id="overview" active={activeSection} onClick={scrollToSection}>Overview</NavItem>
              <NavItem id="architecture" active={activeSection} onClick={scrollToSection}>System Architecture</NavItem>
              <NavItem id="user-types" active={activeSection} onClick={scrollToSection}>Supported User Types</NavItem>
            </NavSection>

            <NavSection title="Using FormSync">
              <NavItem id="templates" active={activeSection} onClick={scrollToSection}>Creating Forms with Templates</NavItem>
              <NavItem id="schema-editor" active={activeSection} onClick={scrollToSection}>Schema Editor Overview</NavItem>
              <NavItem id="formats" active={activeSection} onClick={scrollToSection}>Multiple Input Formats</NavItem>
            </NavSection>

            <NavSection title="AI-Assisted Features">
              <NavItem id="ai-suggestions" active={activeSection} onClick={scrollToSection}>AI Schema Suggestions</NavItem>
              <NavItem id="apply-undo" active={activeSection} onClick={scrollToSection}>Applying and Undoing Suggestions</NavItem>
              <NavItem id="quality-scoring" active={activeSection} onClick={scrollToSection}>Schema Quality Scoring</NavItem>
            </NavSection>

            <NavSection title="Validation & Optimization">
              <NavItem id="validation" active={activeSection} onClick={scrollToSection}>Schema Validation Process</NavItem>
              <NavItem id="errors" active={activeSection} onClick={scrollToSection}>Error Detection & Handling</NavItem>
              <NavItem id="best-practices" active={activeSection} onClick={scrollToSection}>Best Practices</NavItem>
            </NavSection>

            <NavSection title="Export & Integration">
              <NavItem id="export" active={activeSection} onClick={scrollToSection}>Exporting Schemas</NavItem>
              <NavItem id="integration" active={activeSection} onClick={scrollToSection}>External Systems</NavItem>
            </NavSection>

            <NavSection title="Components">
              <NavItem id="comp-templates" active={activeSection} onClick={scrollToSection}>Template Builder</NavItem>
              <NavItem id="comp-editor" active={activeSection} onClick={scrollToSection}>Schema Editor</NavItem>
              <NavItem id="comp-ai" active={activeSection} onClick={scrollToSection}>AI Enhancement Engine</NavItem>
              <NavItem id="comp-quality" active={activeSection} onClick={scrollToSection}>Quality Evaluation</NavItem>
            </NavSection>

            <NavSection title="Help & Reference">
              <NavItem id="faqs" active={activeSection} onClick={scrollToSection}>FAQs</NavItem>
              <NavItem id="common-errors" active={activeSection} onClick={scrollToSection}>Common Errors</NavItem>
              <NavItem id="limitations" active={activeSection} onClick={scrollToSection}>Limitations</NavItem>
              <NavItem id="support" active={activeSection} onClick={scrollToSection}>Support</NavItem>
            </NavSection>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">FormSync Documentation</h1>

          <Section id="overview" title="Overview">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              FormSync is a web-based platform that helps you create, validate, and optimize form schemas with AI assistance. 
              The system supports multiple input formats and provides real-time quality scoring to ensure your forms meet 
              enterprise standards.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Whether you're a non-technical user starting with templates or a developer building custom schemas, 
              FormSync streamlines the entire form creation workflow with intelligent suggestions and automated validation.
            </p>
          </Section>

          <Section id="architecture" title="System Architecture">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              FormSync consists of four core components working together:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
              <li>Template-Based Form Builder for rapid prototyping</li>
              <li>Schema Editor with multi-format support</li>
              <li>AI Enhancement Engine for intelligent suggestions</li>
              <li>Quality Evaluation Engine for continuous assessment</li>
            </ul>
          </Section>

          <Section id="user-types" title="Supported User Types">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Non-Technical Users</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Start with pre-built templates, customize through a visual interface, and leverage AI suggestions 
                  without writing code.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Technical Users</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Create schemas from scratch, work directly with JSON/YAML/XML, and integrate with external systems.
                </p>
              </div>
            </div>
          </Section>

          <Section id="templates" title="Creating Forms with Templates">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Templates provide a quick start for common form types:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
              <li>Click the Templates button in the editor</li>
              <li>Select a template that matches your use case</li>
              <li>The template loads automatically into the editor</li>
              <li>Customize fields as needed</li>
              <li>Run AI Enhancement for additional improvements</li>
            </ol>
          </Section>

          <Section id="schema-editor" title="Schema Editor Overview">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The Schema Editor provides a code-based interface for creating and modifying form structures. 
              It supports syntax highlighting, real-time validation, and format conversion.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Technical users can write schemas directly while seeing immediate feedback on structure and validity.
            </p>
          </Section>

          <Section id="formats" title="Multiple Input Formats">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              FormSync supports three input formats:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
              <li><strong>JSON:</strong> Standard format for web applications</li>
              <li><strong>YAML:</strong> Human-readable format with minimal syntax</li>
              <li><strong>XML:</strong> Traditional enterprise format</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              All formats are converted to a standardized internal representation for processing.
            </p>
          </Section>

          <Section id="ai-suggestions" title="AI Schema Suggestions">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The AI Enhancement Engine analyzes your schema and generates targeted suggestions for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
              <li>Validation rules (email patterns, password requirements)</li>
              <li>Accessibility improvements (labels, descriptions)</li>
              <li>Consistency fixes (naming conventions, field types)</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              Suggestions are optional and require explicit user approval before application.
            </p>
          </Section>

          <Section id="apply-undo" title="Applying and Undoing Suggestions">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Each suggestion can be individually applied or undone:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
              <li>Click Apply to accept a suggestion</li>
              <li>The schema updates immediately</li>
              <li>Quality score recalculates in real-time</li>
              <li>Click Undo to reverse any applied suggestion</li>
              <li>Use Apply All or Undo All for batch operations</li>
            </ul>
          </Section>

          <Section id="quality-scoring" title="Schema Quality Scoring">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
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
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Validation occurs in three stages:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
              <li>Format validation (JSON/YAML/XML syntax)</li>
              <li>Structure validation (required properties, types)</li>
              <li>Semantic validation (field relationships, constraints)</li>
            </ol>
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              Errors are displayed with line numbers and specific guidance for resolution.
            </p>
          </Section>

          <Section id="errors" title="Error Detection & Handling">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Common errors and resolutions:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
              <li><strong>Syntax errors:</strong> Check for missing commas or quotes</li>
              <li><strong>Type mismatches:</strong> Ensure field types are valid</li>
              <li><strong>Missing properties:</strong> Add required schema properties</li>
            </ul>
          </Section>

          <Section id="best-practices" title="Best Practices for High-Quality Schemas">
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
              <li>Start with templates when possible</li>
              <li>Run validation before AI enhancement</li>
              <li>Apply accessibility suggestions for public-facing forms</li>
              <li>Use consistent naming conventions</li>
              <li>Target a quality score above 80</li>
            </ul>
          </Section>

          <Section id="export" title="Exporting Schemas">
            <p className="text-gray-600 dark:text-gray-400">
              Enhanced schemas can be copied from the output panel and used directly in your application. 
              The schema follows JSON Schema standards and is compatible with most form libraries.
            </p>
          </Section>

          <Section id="integration" title="Using Schemas in External Systems">
            <p className="text-gray-600 dark:text-gray-400">
              FormSync schemas work with form validation libraries, API validators, and database schema tools. 
              Export the final JSON and integrate it into your development workflow.
            </p>
          </Section>

          <Section id="comp-templates" title="Component: Template-Based Form Builder">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The Template Builder enables rapid form creation without coding:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
              <li>Pre-configured form types (Contact, Registration, Survey, Feedback)</li>
              <li>One-click loading into the editor</li>
              <li>Customizable fields and validation</li>
              <li>Automatic AI enhancement compatibility</li>
            </ul>
          </Section>

          <Section id="comp-editor" title="Component: Schema Editor">
            <p className="text-gray-600 dark:text-gray-400">
              A code editor with syntax highlighting, validation feedback, and multi-format support. 
              Suitable for technical users who prefer direct schema manipulation.
            </p>
          </Section>

          <Section id="comp-ai" title="Component: AI Enhancement Engine">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              AI analyzes schema structure and generates suggestions for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
              <li>Missing validation rules</li>
              <li>Accessibility improvements</li>
              <li>Naming consistency</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              All suggestions require user approval (human-in-the-loop design).
            </p>
          </Section>

          <Section id="comp-quality" title="Component: Schema Quality Evaluation">
            <p className="text-gray-600 dark:text-gray-400">
              Real-time quality scoring across five dimensions. Scores update dynamically as suggestions are applied or undone, 
              providing immediate feedback on schema improvements.
            </p>
          </Section>

          <Section id="faqs" title="Frequently Asked Questions">
            <div className="space-y-4">
              <FAQ question="Do I need coding knowledge?" answer="No. Non-technical users can start with templates and use AI assistance without writing code." />
              <FAQ question="What quality score should I target?" answer="Aim for 80 or higher. Scores above 85 indicate excellent quality." />
              <FAQ question="Can I undo AI changes?" answer="Yes. Every suggestion can be individually undone at any time." />
              <FAQ question="Are schemas saved automatically?" answer="No. Export and save schemas locally or copy them to your application." />
            </div>
          </Section>

          <Section id="common-errors" title="Common Errors">
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
              <li><strong>Invalid JSON:</strong> Check syntax (commas, brackets, quotes)</li>
              <li><strong>Low quality score:</strong> Apply AI suggestions for validation and accessibility</li>
              <li><strong>Validation failed:</strong> Ensure required properties are present</li>
            </ul>
          </Section>

          <Section id="limitations" title="Limitations">
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
              <li>AI enhancement requires internet connection</li>
              <li>Complex nested schemas may need manual refinement</li>
              <li>No automatic schema versioning</li>
            </ul>
          </Section>

          <Section id="support" title="Support">
            <p className="text-gray-600 dark:text-gray-400">
              For technical support, bug reports, or feature requests, contact your system administrator.
            </p>
          </Section>
        </div>
      </main>
    </div>
  );
};

const NavSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{title}</h3>
    <div className="space-y-1">{children}</div>
  </div>
);

const NavItem: React.FC<{ id: string; active: string; onClick: (id: string) => void; children: React.ReactNode }> = ({ id, active, onClick, children }) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
      active === id
        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-l-2 border-indigo-600'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`}
  >
    {children}
  </button>
);

const Section: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
  <section id={id} className="mb-12 scroll-mt-8">
    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">{title}</h2>
    <div className="space-y-4">{children}</div>
  </section>
);

const ScoreDimension: React.FC<{ name: string; weight: string; description: string }> = ({ name, weight, description }) => (
  <div className="flex justify-between items-start p-3 bg-gray-100 dark:bg-gray-800 rounded">
    <div>
      <h4 className="font-medium text-gray-900 dark:text-gray-100">{name}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{weight}</span>
  </div>
);

const FAQ: React.FC<{ question: string; answer: string }> = ({ question, answer }) => (
  <div>
    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{question}</h4>
    <p className="text-gray-600 dark:text-gray-400 text-sm">{answer}</p>
  </div>
);
