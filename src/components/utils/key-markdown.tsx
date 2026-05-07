"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface KeyMarkdownProps {
  content: string;
  className?: string;
}

// This is a wrapper component that adds stable keys to ReactMarkdown
const KeyMarkdown: React.FC<KeyMarkdownProps> = ({ content, className }) => {
  return (
    <div className={`${className} meal-plan-markdown`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
      
      <style jsx global>{`
        .meal-plan-markdown {
          color: white;
          line-height: 1.6;
        }
        
        .meal-plan-markdown ul, .meal-plan-markdown ol {
          list-style-position: inside;
          margin: 0.75rem 0;
          padding-left: 1.5rem;
        }
        
        .meal-plan-markdown ul {
          list-style-type: disc;
        }
        
        .meal-plan-markdown ol {
          list-style-type: decimal;
        }
        
        .meal-plan-markdown li {
          margin: 0.5rem 0;
        }
        
        .meal-plan-markdown table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          font-size: 0.9em;
        }
        
        .meal-plan-markdown thead {
          background-color: #374151;
        }
        
        .meal-plan-markdown th {
          background-color: #374151;
          color: #93c5fd;
          font-weight: 600;
          text-align: left;
          padding: 0.75rem 1rem;
          border-bottom: 2px solid #4b5563;
        }
        
        .meal-plan-markdown tbody {
          background-color: rgba(55, 65, 81, 0.3);
        }
        
        .meal-plan-markdown td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #4b5563;
        }
        
        .meal-plan-markdown h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #60a5fa;
        }
        
        .meal-plan-markdown h4 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #93c5fd;
        }
        
        .meal-plan-markdown p {
          margin: 1rem 0;
        }
        
        .meal-plan-markdown pre {
          background-color: #111827;
          padding: 1rem;
          border-radius: 0.375rem;
          margin: 1.5rem 0;
          overflow-x: auto;
        }
        
        .meal-plan-markdown code {
          font-family: monospace;
          font-size: 0.875rem;
          background-color: rgba(17, 24, 39, 0.7);
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
        }
        
        .meal-plan-markdown blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #d1d5db;
        }
        
        .meal-plan-markdown strong {
          font-weight: 700;
          color: #f3f4f6;
        }
        
        .meal-plan-markdown em {
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default KeyMarkdown; 