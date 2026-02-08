import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; 

const MarkdownRenderer = ({ content }) => {
  return (
    <ReactMarkdown
      children={content}
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
       
        p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-7" {...props} />,
        a: ({node, ...props}) => <a className="text-blue-500 hover:underline" target="_blank" rel="noreferrer" {...props} />,
        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
        li: ({node, ...props}) => <li className="pl-1" {...props} />,
        code: ({node, inline, className, children, ...props}) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline ? (
                <div className="bg-gray-800 text-gray-100 rounded-md p-3 my-2 overflow-x-auto text-sm">
                    <code className={className} {...props}>{children}</code>
                </div>
            ) : (
                <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono text-red-500 dark:text-red-400" {...props}>{children}</code>
            );
        }
      }}
    />
  );
};

export default MarkdownRenderer;