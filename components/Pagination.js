import React from 'react';
import Link from 'next/link';
import url from 'url';

export default function Pagination({
  query = {}, // URL params
  firstCursor,
  lastCursor,
  firstCursorOfPage,
  lastCursorOfPage,
}) {
  return (
    <p>
      {firstCursor && firstCursor !== firstCursorOfPage
        ? <Link
            href={url.format({
              query: { ...query, before: firstCursorOfPage, after: undefined },
            })}
          >
            <a>Prev</a>
          </Link>
        : ''}
      {lastCursor && lastCursor !== lastCursorOfPage
        ? <Link
            href={url.format({
              query: { ...query, after: lastCursorOfPage, before: undefined },
            })}
          >
            <a>Next</a>
          </Link>
        : ''}
      <style jsx>{`
        a {
          padding: 8px;
        }
      `}</style>
    </p>
  );
}
