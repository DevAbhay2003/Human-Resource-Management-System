# The Neotia University (TNU) — Enterprise HRMS & ERP Automation System

> **Official College Production Release — Modules I, II & III Complete SOP Implementation**  
> *Statutory Compliance: UGC Regulations, NAAC Quality Benchmarks & University Governance SOPs*

---

## 🏛️ Executive Summary & Overview

The **TNU Enterprise HRMS & ERP Automation System** is an end-to-end, real-time, auditable university governance platform engineered specifically for **The Neotia University**. It digitizes, automates, and interlinks every service milestone across the faculty and staff lifecycle without manual paper routing or redundant data entry.

The system comprehensively incorporates all **four foundational resources**:
1. **Module I**: HR Change Management & Automation System (Controlled Service Conditions Journey)
2. **Module II**: Recruitment & Selection Automation System (Manpower Planning to Yet-to-Join)
3. **Module III**: Performance Management Automation System (Group-D Monthly SOP, General KRA/KPI Quarters, and Faculty ECM Protocol)
4. **Module III Complete Workflow Architecture**: Full multi-track SOP flow diagram

---

## 🧭 Functional Modules Breakdown

### 🔹 Module I: HR Change Management & Automation System
* **Single Source of Truth**: Central Employee Database storing salary, designation, level, department/school, location, reporting hierarchy, probation status, qualifications, and digital dossier.
* **Controlled Service Changes**: Covers Salary Revisions, Designation Promotions, Pay Level Upgrades, Departmental Transfers, Reporting Authority Modifications, Additional Responsibilities, and Qualification Updates.
* **2-Tier Statutory Approval Hierarchy**:
  1. *Tier 1 (HR Level)*: Review against UGC/University policy; can Recommend to Management, Request Clarification, or Reject.
  2. *Tier 2 (Senior Management / Vice-Chancellor)*: Approves with specific Effective Date.
* **Effective Date Scheduling Engine**: Changes can become effective immediately or at a future date (e.g. 1st of next month). The scheduler applies the update to the Central DB and live Org Chart automatically on that date.
* **Interactive Dynamic Org Chart**: Live visual reporting tree computed dynamically from central reporting relationships.
* **Immutable Audit Trail & Version Control**: Logs every change with actor name, role, timestamp, IP address, and JSON before/after diffs.
* **Real-Time Configurable Reporting**: Breakdown by department, change type, pending/approved counts, with JSON/CSV export.

---

### 🔹 Module II: Recruitment & Selection Automation System
* **Manpower Planning & Requisitions (MRF)**:
  * *Academic Pathway*: Initiated by Associate Dean/Dean with teaching load analysis (e.g. 16 hrs/wk) to maintain 1:15 student-teacher ratio. Vetted by Associate Dean (Academics) and sanctioned by Pro-Chancellor / Senior Management.
  * *Non-Academic Pathway*: Initiated by Department HOD for operational staffing. Vetted by Head HR and sanctioned by VP – Administration.
  * *Urgent / Replacement MRF*: Directly triggered upon employee resignation acceptance event.
* **Open Positions Tracker (TAT SLAs)**:
  * Tracks vacancies with real-time turnaround countdowns (45 days Academic, 30 days Non-Academic, 25 days Urgent Replacement).
* **Multi-Channel Job Postings**: Configurable sourcing via University Portal, LinkedIn, Facebook, Instagram, Print Media, and Internshala.
* **Central CV Database with Automated UGC Screening**:
  * Auto-computes qualification score (Ph.D. completed, UGC NET/GATE qualified, experience years).
* **Recruiter Calling Screen (RCS)**:
  * Recruiter records candidate phone interactions, notice period, CTC expectations, and routes to Head HR.
  * Senior Management interview clearance gate.
* **Dual Selection Pathways**:
  * *Academic Selection Committee*: Committee composition with External Subject Expert (e.g. from IIT/ISI), digital scoring on Pedagogy (100) and Research Publications (100), Committee recommendations.
  * *Non-Academic 3-Round Matrix*: Technical Round (HOD) → HR Round (Communication/Culture) → Management Round (Integrity/Leadership).
* **Management Cost Approval & LOI Generation**:
  * Senior Management sanctions monthly CTC and designation; auto-generates official Letter of Intent (LOI).
* **Yet-to-Join & Pre-Onboarding Tracker**:
  * Candidate LOI acceptance, notice period tracking, and statutory milestone checklist (Police BGV, Certifications verified, Relieving letter, Medical fitness).
* **1-Click Seamless Onboarding**:
  * Converts "Yet to Join" candidate into active employee in Module I Central Employee DB and automatically initializes 30-day Goal-Setting in Module III!

---

### 🔹 Module III: Performance Management Automation System (All 3 Tracks)

#### 🔸 Track A: Group-D / Band I Employees (Monthly SOP + Annual + Compensation)
1. **Digital Evaluation Form Repository**: Role-specific KPI and competency templates (Office Attendants, Lab Helpers, Drivers) configurable and version-controlled by HR.
2. **Monthly Routing to Department HODs**: System routes evaluation forms based on reporting hierarchy pulled from Central DB.
3. **Enforced Timelines & Grace Period**:
   * *Due Date*: **7th of every month**.
   * *Grace Period*: **3 additional days (up to the 10th)**.
   * *Auto-Lock Mechanism*: Forms not submitted by the 10th are automatically locked by the system, flagged as "Not Submitted", and recorded with reasons visible to HR.
4. **VP – Administration Final Sign-Off**: All monthly HOD submissions require formal administrative approval before filing.
5. **Automatic Collation & Annual Report**: On completion of 1 year of employment (based on DOJ), system collates all 12 monthly reports and computes the weighted average score.
6. **Compensation Review Workflow**: Applies pre-defined compensation slabs (+10% merit increment) against weighted score. **Mandatory validation: strictly checks probation status (must be COMPLETED before compensation review activates).**

#### 🔸 Track B: General Employees (Non-Faculty KRA/KPI & 4 Quarters)
1. **Stage 1 (30-Day Goal Setting)**: Intimation on joining; employee and reporting authority submit KRAs/KPIs within 30 days. Verified by HR and Management before locking.
2. **Stage 2 (Quarterly Review Cycle Q1–Q4)**: Intimation at 90, 180, 270, and 360 days. 15-day submission window, auto-reminder at 20 days. Verified by Reporting Authority within 7 days, reviewed by HR, and approved by Senior Management.
3. **Stage 3 (Close-the-Loop Integration)**: Post-Q4 appraisal outcome directly triggers a service change requirement in **Module I** (salary revision or designation) without duplicate re-entry!

#### 🔸 Track C: Faculty Members (ECM Based Annual Appraisal)
1. **Auto-Eligibility Determination**: Identifies faculty members who completed probation and have ≥ 12 months of service since DOJ or previous appraisal.
2. **Monthly Registrar Routing**: Auto-generates eligible list and routes from HR to Office of the Registrar by the **10th of every month**.
3. **Self-Appraisal Submission (7 Working Days)**: Faculty submits teaching hours, Scopus/IEEE papers, research grants, and institutional contributions.
4. **Multi-Stakeholder Verification Routing**: Routes to School Dean, R&D Cell, Placement Cell, and HR Dept. Features a **Discrepancy Loop** that returns forms to faculty for correction if needed.
5. **Evaluation Committee Meeting (ECM)**: Registrar schedules monthly ECM with committee members and external experts.
6. **Digital ECM Score Sheet (TNU Protocol)**: Evaluates Teaching (100), Research (100), Consultancy (50), and Institutional Dev (50) out of 300 total points.
7. **Management Decision & Payroll Implementation**: Senior Management records decision (Promotion, Increment, Confirmation, Extension, PIP, or Reprimand), auto-generates official order letter, and routes directly to HR/Payroll for the next salary cycle.

---

## 🛠️ DevOps, Infrastructure & Production Readiness

The repository is built with enterprise DevOps practices for immediate production rollout onto the college web servers:

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | Node.js 24 + Express | REST API, ACID persistence, audit trail, background scheduler daemon |
| **Frontend** | React 19 + Vite 8 + Tailwind CSS v4 | High-performance single page application with modern UI & Lucide icons |
| **Containerization** | Multi-Stage Dockerfile | Builder stage + minimal Alpine Linux runtime running as non-root `node` user |
| **Orchestration** | Docker Compose | Multi-container setup with persistent volume for ACID storage and healthchecks |
| **Reverse Proxy** | Nginx (Alpine) | SSL/TLS termination, HTTP/2, Gzip compression, HSTS, and X-Frame-Options |
| **CI/CD** | GitHub Actions | Automated linting, test build verification, and containerization staging |
| **Observability** | `/api/health` & `/api/metrics` | Real-time healthcheck probe and Prometheus-compatible metrics endpoint |

---

## 🚀 Step-by-Step Deployment Instructions

### 1. Local Development Run (Windows / Linux / macOS)

```bash
# 1. Clone repository and navigate to folder
cd C:\Users\user\Desktop\hrms

# 2. Install root and client dependencies
npm install
cd client && npm install && npm run build
cd ..

# 3. Start the unified production server
npm start
```
* **Application URL**: `http://localhost:5000`
* **API Health Probe**: `http://localhost:5000/api/health`
* **Prometheus Metrics**: `http://localhost:5000/api/metrics`

---

### 2. Docker & Docker Compose Production Deployment

```bash
# Build and run containers in background with persistent volume
docker-compose up -d --build

# Verify container health status
docker-compose ps
```

---

### 3. Nginx Reverse-Proxy Setup (College IT VPS)

1. Place your official university SSL certificate in `./ssl/tnu_hrms.crt` and private key in `./ssl/tnu_hrms.key`.
2. Configure DNS record: `hrms.tnu.edu.in` pointing to the server public IP.
3. Start Nginx:
   ```bash
   docker-compose restart nginx-proxy
   ```

---

## ⏱️ SOP Time Machine (For Evaluators & Reviewers)

To demonstrate the automated scheduled SOP logic (such as the **7th submission due date**, **10th grace period auto-lock**, **90-day Q1 review**, and **Module I future effective dates**):
1. Click the **"Time Warp"** button in the top navigation bar.
2. Select any preset scenario (e.g. *Group-D Grace Period Deadline & Auto-Lock on 11 Oct 2026* or *Module I Future Effective Date on 01 Nov 2026*).
3. Click **"Jump & Run"** or **"Force Auto-Lock"**.
4. Observe the live system execution output and watch the policy rules enforce in real time across the database!

---

## 📄 License & Institutional Attribution
* **Institution**: The Neotia University (TNU), West Bengal, India
* **Motto**: ज्ञानम् आत्म प्रदीपाय (Knowledge for Self-Enlightenment)
* **Campus**: Sarisa, D.H. Road, 24 Parganas (South), West Bengal 743368
* **Statutory Status**: Established under WB State Act XXIII of 2014 • Approved under Sec. 2(f) of UGC Act 1956
* **System**: Enterprise HRMS & ERP Automation System (Modules I, II & III)
* **Lead Developer & System Architect**: **Abhay**
* **Author**: **Abhishek Basu — Embedded Systems Student GitHub: [DevAbhay2003](https://github.com/DevAbhay2003?tab=repositories) · LinkedIn: [Abhishek Basu](https://www.linkedin.com/in/abhishek-basu-68b1b1342/)**
* **Engineered for**: Official College Web Production Rollout

---

## AUTHOR
- **Project Lead**: **Abhishek Basu**
- **GitHub**: [DevAbhay2003](https://github.com/DevAbhay2003?tab=repositories)
- **LinkedIn**: [https://linkedin.com/in/your-profile](https://www.linkedin.com/in/abhishek-basu-68b1b1342/)
- **Email**: devabhishekbasu03@gmail.com
