# Security Policy

We take the security of Choferes de Alquiler and its users seriously.
This document outlines how to report vulnerabilities and what to expect.

---

## Supported Versions

Only the latest release is supported with security updates.
There are no long-term support (LTS) branches at this time.

| Version | Supported |
| --- | --- |
| Latest release | ✅ |
| Older releases | ❌ |

---

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not** open a public GitHub issue.

Instead, report it privately via email:

**Email**: `security@choferes-alquiler.com`

If that address is not yet active, contact one of the project maintainers directly through GitHub.

### What to include

To help us triage and fix the issue quickly, please include:

- **Type of vulnerability** (e.g., SQL injection, XSS, authentication bypass, insecure data storage)
- **Affected component** (e.g., API endpoint, frontend page, database migration)
- **Steps to reproduce** — a minimal, clear description or proof of concept
- **Impact** — what an attacker could achieve
- **Environment** (browser version, Node version, deployment type)
- **Suggested fix** (optional but appreciated)

### What to expect

| Step | Timeline |
| --- | --- |
| Acknowledgment of receipt | Within 48 hours |
| Initial assessment and severity rating | Within 5 business days |
| Fix deployed (critical issues) | Within 14 days |
| Fix deployed (moderate / low issues) | Next regular release |

We will coordinate with you on disclosure timing. Once a fix is released, we will credit you in the release notes (unless you prefer to remain anonymous).

---

## Security Measures in This Project

### Authentication & Authorization

- **JWT** with separate access and refresh tokens
- **httpOnly cookies** for refresh token storage (prevents XSS token theft)
- **Rate limiting** on all API routes to mitigate brute-force attacks
- **Role-based access control** (RBAC) middleware on every protected endpoint
- **Permission-based UI rendering** — unauthorized actions are hidden, not just disabled

### Data Protection

- **Helmet** middleware for secure HTTP headers
- **CORS** restricted to known origins
- **Input validation** via `express-validator` on all API endpoints
- **SQL injection prevention** through Sequelize parameterized queries
- **Password hashing** with bcrypt before storage

### Infrastructure

- Regular dependency updates via Dependabot (configured in GitHub)
- CI pipeline runs linting and tests on every pull request
- Environment variables for all secrets (no hardcoded credentials)
- Docker containers run with least-privilege user

---

## Responsible Disclosure

We ask that you:

- Give us reasonable time to fix the issue before public disclosure
- Do not exploit the vulnerability beyond what is necessary to demonstrate it
- Do not access or modify other users' data without permission
- Follow applicable laws and regulations

We will:

- Respond promptly and keep you informed of progress
- Fix the issue and deploy the update
- Acknowledge your contribution (with your consent)

---

## Scope

The following are **in scope** for security reports:

- The web application (frontend and API)
- Authentication and authorization mechanisms
- Data storage and transmission
- API endpoints

The following are **out of scope**:

- Third-party services (Vercel, Render, Docker, GitHub Actions)
- Generic dependency vulnerabilities already tracked by Dependabot
- Theoretical attacks with no practical impact

---

## Contact

**Email**: `security@choferes-alquiler.com`

If you have questions about this policy, open a discussion or reach out to the maintainers on GitHub.
