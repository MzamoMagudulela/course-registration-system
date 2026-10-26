import React from 'react';
import { ExternalLink, Database, Shield, Code } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-inner">
        <div className="footer-col">
          <h4 className="footer-heading">Course Registration System</h4>
          <p className="footer-desc">
            A production-ready academic registration platform engineered with FastAPI, SQLAlchemy, SQLite, and React.
          </p>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">API & Architecture</h4>
          <ul className="footer-links">
            <li>
              <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="footer-link">
                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                Swagger OpenAPI Docs
              </a>
            </li>
            <li>
              <a href="http://localhost:8000/redoc" target="_blank" rel="noopener noreferrer" className="footer-link">
                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                ReDoc Specification
              </a>
            </li>
            <li>
              <span className="footer-meta-item">
                <Database className="w-3.5 h-3.5 mr-1 text-slate-400" />
                SQLite + SQLAlchemy ORM
              </span>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Security & Standards</h4>
          <p className="footer-desc text-xs">
            Role-Based Access Control (RBAC), bcrypt salted hashing, signed JWT tokens, atomic transaction safety, and comprehensive pytest verification.
          </p>
          <div className="footer-badge-row">
            <span className="badge-tech">FastAPI</span>
            <span className="badge-tech">React 19</span>
            <span className="badge-tech">Pytest</span>
            <span className="badge-tech">Pydantic v2</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Course Registration System. Built for ICT Developer Portfolio.</p>
      </div>
    </footer>
  );
}
