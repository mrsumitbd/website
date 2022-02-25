import React, { useState } from "react";
import clsx from "clsx";
import styles from "./Publications.module.css";
import groupedPapers from "../data/publications-list.build";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-regular-svg-icons";
import CodeBlock from "@theme/CodeBlock";
import { faQuoteLeft } from "@fortawesome/free-solid-svg-icons";
import TOCInline from "@theme/TOCInline";

function Authors({ list }) {
  const lastIndex = list.length - 1;

  return (
    <p>
      {list.map(
        ({ given, family }, index) =>
          `${index > 0 ? (index === lastIndex ? ", and " : ", ") : ""}${
            given[0]
          }. ${family}`
      )}
    </p>
  );
}

function Paper(paper) {
  const [isBibtexOpen, setBibtexState] = useState(false);

  return (
    <div className="card">
      <div className="card__header">
        <h4 className={styles.paperTitles}>{paper.title}</h4>
      </div>
      <div className="card__body">
        <Authors list={paper.authors} />
        {paper.venue}
        <div className={clsx("button-group", styles.floatButtons)}>
          <button
            onClick={() => setBibtexState(!isBibtexOpen)}
            className={clsx(
              "button button--outline button--sm button--secondary",
              { "button--active": isBibtexOpen }
            )}
          >
            <FontAwesomeIcon icon={faQuoteLeft} /> BibTeX
          </button>
          {paper.has_pdf && (
            <a
              className="button button--outline button--sm button--secondary"
              target="_blank"
              href={`/pdf/${paper.id}.pdf`}
            >
              <FontAwesomeIcon icon={faFilePdf} /> PDF
            </a>
          )}
        </div>
      </div>
      {isBibtexOpen && (
        <div className="card__footer">
          <CodeBlock>{paper.bibtex}</CodeBlock>
        </div>
      )}
    </div>
  );
}

function PublicationTypeList({ title, papers }) {
  if (!papers?.length) return null;
  return (
    <>
      <div className="row">
        <div className="col col--12">
          <h3 className={styles.type}>{title}</h3>
        </div>
      </div>
      <div className="row">
        {papers.map((paper) => (
          <div key={paper.id} className="col col--12 margin-bottom--lg">
            <Paper {...paper} />
          </div>
        ))}
      </div>
    </>
  );
}

function PublicationYearList({ papers }) {
  return (
    <section>
      <div className="container">
        {papers.map((yearPapers) => (
          <div key={yearPapers.year}>
            <div className="row">
              <div className="col col--12">
                <h2 className={styles.year}>{yearPapers.year}</h2>
              </div>
            </div>
            <PublicationTypeList
              title="Journals"
              papers={yearPapers["article-journal"]}
            />
            <PublicationTypeList
              title="Conferences"
              papers={yearPapers["paper-conference"]}
            />
            <PublicationTypeList title="Theses" papers={yearPapers.thesis} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function AllPublications() {
  return <PublicationYearList papers={groupedPapers} />;
}

function HighlightedAuthors({ list }) {
  const lastIndex = list.length - 1;
  const highlightIndex = list.index;

  return (
    <>
      {list.map(({ given, family }, index) => (
        <span key={index}>
          {index > 0 ? (index === lastIndex ? ", and " : ", ") : ""}
          {index == highlightIndex ? (
            <b>
              {given[0]}. {family}
            </b>
          ) : (
            `${given[0]}. ${family}`
          )}
        </span>
      ))}
    </>
  );
}

function AuthorPaper(paper) {
  const [isBibtexOpen, setBibtexState] = useState(false);

  return (
    <li className="margin-bottom--md">
      <HighlightedAuthors list={paper.authors} />, <i>"{paper.title},"</i> in{" "}
      {paper.venue}, {paper.year}
      <div className="button-group">
        {paper.has_pdf && (
          <a
            className="button button--sm button--link"
            target="_blank"
            href={`/pdf/${paper.id}.pdf`}
          >
            <FontAwesomeIcon icon={faFilePdf} /> PDF
          </a>
        )}
        <button
          onClick={() => setBibtexState(!isBibtexOpen)}
          className={clsx("button button--sm button--link", {
            "button--active": isBibtexOpen,
          })}
        >
          <FontAwesomeIcon icon={faQuoteLeft} /> BibTeX
        </button>
      </div>
      {isBibtexOpen && <CodeBlock>{paper.bibtex}</CodeBlock>}
    </li>
  );
}

function AuthorPublicationTypeList({ title, papers }) {
  if (!papers?.length) return null;
  return (
    <>
      <h3 id={title}>{title}</h3>
      <ul>
        {papers.map((paper) => (
          <AuthorPaper key={paper.id} {...paper} />
        ))}
      </ul>
    </>
  );
}

export function AuthorPublications({ firstname, lastname }) {
  const journals = [];
  const conferences = [];
  const theses = [];

  function selectPapers({ authors }) {
    const authorIndex = authors.findIndex(
      ({ given, family }) => given.startsWith(firstname) && family === lastname
    );

    if (authorIndex < 0) {
      return false;
    }

    authors.index = authorIndex;

    return true;
  }

  groupedPapers.forEach((year) => {
    journals.push(...(year["article-journal"]?.filter(selectPapers) || []));
    conferences.push(...(year["paper-conference"]?.filter(selectPapers) || []));
    theses.push(...(year["thesis"]?.filter(selectPapers) || []));
  });

  return (
    <>
      <AuthorPublicationTypeList title="Journals" papers={journals} />
      <AuthorPublicationTypeList title="Conferences" papers={conferences} />
      <AuthorPublicationTypeList title="Theses" papers={theses} />
    </>
  );
}