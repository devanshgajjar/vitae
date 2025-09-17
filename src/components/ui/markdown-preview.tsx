'use client';

import React from 'react';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export default function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  // Simple markdown renderer for resume content
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const result: JSX.Element[] = [];
    let currentSection = '';

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) {
        result.push(<div key={index} className="h-3" />);
        return;
      }

      // Headers (## SECTION)
      if (trimmedLine.startsWith('## ')) {
        const headerText = trimmedLine.substring(3);
        currentSection = headerText;
        result.push(
          <div key={index} className="mt-6 mb-3">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-1">
              {headerText}
            </h2>
          </div>
        );
        return;
      }

      // Name/Title (starts with ** and ends with **)
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**') && trimmedLine.length > 4) {
        const text = trimmedLine.substring(2, trimmedLine.length - 2);
        if (currentSection === '' || currentSection === 'CONTACT') {
          // Main name
          result.push(
            <h1 key={index} className="text-2xl font-bold text-gray-900 mb-2">
              {text}
            </h1>
          );
        } else {
          // Section titles (job titles, school names, etc.)
          result.push(
            <h3 key={index} className="text-base font-semibold text-gray-900 mt-4 mb-1">
              {text}
            </h3>
          );
        }
        return;
      }

      // Contact info and dates (usually after name)
      if (currentSection === '' && (trimmedLine.includes('@') || trimmedLine.includes('+') || trimmedLine.includes('http'))) {
        result.push(
          <div key={index} className="text-sm text-gray-600 mb-1">
            {trimmedLine}
          </div>
        );
        return;
      }

      // Bullet points (start with -)
      if (trimmedLine.startsWith('- ')) {
        const text = trimmedLine.substring(2);
        result.push(
          <div key={index} className="flex items-start gap-2 mb-1">
            <span className="text-gray-400 mt-1.5">•</span>
            <span className="text-sm text-gray-700 leading-relaxed">{text}</span>
          </div>
        );
        return;
      }

      // Company/Institution with dates (contains commas or years)
      if (/\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/.test(trimmedLine)) {
        result.push(
          <div key={index} className="text-sm text-gray-600 italic mb-2">
            {trimmedLine}
          </div>
        );
        return;
      }

      // Regular paragraphs
      result.push(
        <p key={index} className="text-sm text-gray-700 leading-relaxed mb-2">
          {trimmedLine}
        </p>
      );
    });

    return result;
  };

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <div className="bg-white p-6 rounded-lg border border-gray-200 min-h-[400px] font-serif leading-relaxed">
        {renderMarkdown(content)}
      </div>
    </div>
  );
}
