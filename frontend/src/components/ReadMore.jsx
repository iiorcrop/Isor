import React, { useState } from 'react';

/**
 * ReadMore component – collapses long HTML/text content and shows a "Read more" / "Show less" toggle.
 * It works with raw HTML strings (e.g., page.content) and safely renders them via `dangerouslySetInnerHTML`.
 */
const ReadMore = ({ children, limit = 800 }) => {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => setExpanded(!expanded);

  if (!children) return null;

  // Check if text length is significant enough to collapse
  const plainTextLength = children.replace(/<[^>]+>/g, '').length;
  const isLong = plainTextLength > limit;

  return (
    <div className="read-more-wrapper">
      <div
        className={`read-more-content transition-all duration-500 overflow-hidden relative ${
          !expanded && isLong ? 'max-h-[450px]' : 'max-h-none'
        }`}
        dangerouslySetInnerHTML={{ __html: children }}
      />
      {!expanded && isLong && (
        <div className="h-12 bg-gradient-to-t from-white to-transparent -mt-12 relative z-10 pointer-events-none" />
      )}
      {isLong && (
        <button
          onClick={toggle}
          className="mt-4 text-[#064e3b] font-bold text-sm hover:text-[#b47c1c] transition-colors flex items-center gap-1"
        >
          {expanded ? 'Show less ▲' : 'Read more ▼'}
        </button>
      )}
    </div>
  );
};


export default ReadMore;
