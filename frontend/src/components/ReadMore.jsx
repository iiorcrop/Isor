import React, { useState } from 'react';

/**
 * ReadMore component – collapses long HTML/text content and shows a "Read more" / "Show less" toggle.
 * It works with raw HTML strings (e.g., page.content) and safely renders them via `dangerouslySetInnerHTML`.
 */
const ReadMore = ({ children, limit = 500 }) => {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => setExpanded(!expanded);

  // If content is plain text, we can slice it; if it's HTML we still slice the string (basic).
  const displayContent = expanded ? children : children.slice(0, limit) + (children.length > limit ? '...' : '');

  return (
    <div className="read-more-wrapper">
      <div
        className="read-more-content"
        dangerouslySetInnerHTML={{ __html: displayContent }}
      />
      {children.length > limit && (
        <button
          onClick={toggle}
          className="mt-2 text-[#1e703c] font-semibold hover:underline"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
};

export default ReadMore;
