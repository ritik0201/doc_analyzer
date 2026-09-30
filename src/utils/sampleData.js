export const SAMPLE_DOCUMENTS = [
  {
    fileName: 'Project_Alpha_Q3_Proposal.docx',
    fileType: 'DOCX',
    fileSize: '45.2 KB',
    rawSizeBytes: 46284,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    pageCount: 3,
    wordCount: 842,
    charCount: 5410,
    uploadedAt: 'Just now',
    textContent: `PROJECT ALPHA: Q3 AI AUTOMATION & INFRASTRUCTURE PROPOSAL

1. EXECUTIVE SUMMARY
Project Alpha is a strategic initiative by NovaCorp Solutions aimed at automating internal document workflows, customer support routing, and multi-modal data processing using cloud-native Generative AI models. The goal is to reduce manual turnaround time by 65% and save approximately $1.2M annually across operations.

2. KEY OBJECTIVES & SCOPE
- Implement end-to-end document parsing pipelines for PDF, Word (.docx), and plain text logs.
- Integrate Google Gemini API models (Gemini 2.5 Flash and Gemini Pro) for document reasoning, vector search, and context extraction.
- Deploy a responsive, high-performance web workspace for internal teams by August 15, 2026.
- Ensure strict SOC2 Type II compliance and zero data retention policy on third-party AI provider logs.

3. FINANCIAL BUDGET & RESOURCING
- Cloud Infrastructure (AWS & Google Cloud): $120,000
- Software Licenses & Gemini API Usage: $45,000
- Engineering Team (4 Frontend/Backend Engineers, 1 ML Specialist): $380,000
- Compliance Audit & Security Testing: $35,000
Total Projected Cost: $580,000.

4. DELIVERABLES & MILESTONES
- Milestone 1 (July 10, 2026): Core architecture design and security review approval.
- Milestone 2 (July 25, 2026): Beta launch of Document Intelligence UI and API key integration.
- Milestone 3 (August 10, 2026): Load testing, accuracy benchmarks, and enterprise SSO integration.
- Milestone 4 (August 20, 2026): Full production deployment across 4 global regional hubs.

5. RISKS & MITIGATION STRATEGIES
- Risk A: Rate limits or API latency during peak enterprise usage.
  Mitigation: Implement client-side caching, request queueing, and fallback model endpoints.
- Risk B: Formatting anomalies in legacy PDF documents.
  Mitigation: Dual extraction pipeline combining client-side pdf.js text parsing and native multimodal inline file processing.`
  },
  {
    fileName: 'Cybersecurity_Audit_Report_2026.txt',
    fileType: 'TXT',
    fileSize: '18.6 KB',
    rawSizeBytes: 19045,
    mimeType: 'text/plain',
    pageCount: 2,
    wordCount: 520,
    charCount: 3480,
    uploadedAt: 'Just now',
    textContent: `ANNUAL CYBERSECURITY RISK & PENETRATION AUDIT REPORT 2026

Target Environment: Production API Gateways & Enterprise Portals
Audit Firm: Apex Security Labs
Date of Evaluation: June 18, 2026

FINDINGS SUMMARY:
During the 10-day audit, 3 High, 5 Medium, and 8 Low vulnerability findings were discovered across external endpoints and internal microservices.

CRITICAL & HIGH FINDINGS:
1. High Priority - Outdated API Authorization Token Refresh (CVE-2026-8812)
   - Description: OAuth refresh tokens remained valid for 90 days without active IP bound checks.
   - Impact: Potential session hijacking if access tokens are compromised.
   - Remediation: Reduce refresh token lifespan to 14 days and enforce IP fingerprint validation.

2. High Priority - Unrestricted File Upload Mime-Type Spoofing
   - Description: The document uploader accepted executable payloads disguised as plain text files.
   - Impact: Remote code execution potential on server node.
   - Remediation: Enforce magic byte header inspection and isolate processing in sandboxed Web Workers.

3. Medium Priority - Verbose Error Stack Traces in Production Responses
   - Description: GraphQL endpoints exposed database schema names on malformed queries.
   - Remediation: Mask internal exceptions behind sanitized error codes.

RECOMMENDED IMMEDIATE ACTION PLAN:
- Patch High Priority vulnerabilities within 72 hours.
- Perform automated vulnerability re-scans by July 5, 2026.
- Conduct mandatory security awareness training for software developers before Q4.`
  }
];
