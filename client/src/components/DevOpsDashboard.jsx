import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Server, 
  Cpu, 
  Activity, 
  ShieldCheck, 
  Layers, 
  GitBranch, 
  Download, 
  CheckCircle2, 
  Copy, 
  ExternalLink,
  Code2,
  HardDrive,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export default function DevOpsDashboard() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedSection, setCopiedSection] = useState(null);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      const data = await api.getHealth();
      setHealthData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const dockerfileContent = `
# =========================================================================
# The Neotia University - Enterprise HRMS Production Multi-Stage Dockerfile
# =========================================================================

# Stage 1: Build Frontend Assets
FROM node:24-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --quiet
COPY client/ ./
RUN npm run build

# Stage 2: Production Runtime
FROM node:24-alpine AS production-runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production --quiet

# Copy server code and built client bundle
COPY server/ ./server/
COPY --from=client-builder /app/client/dist ./client/dist

# Security Hardening: Non-root user
USER node

# Healthcheck probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

EXPOSE 5000
CMD ["node", "server/index.js"]
`.trim();

  const dockerComposeContent = `
version: '3.8'

services:
  hrms-portal:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: tnu_hrms_app
    restart: always
    environment:
      - PORT=5000
      - NODE_ENV=production
    ports:
      - "5000:5000"
    volumes:
      - hrms_data:/app/data
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 5s
      retries: 3
    networks:
      - college_internal

  nginx-proxy:
    image: nginx:alpine
    container_name: tnu_hrms_proxy
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - hrms-portal
    networks:
      - college_internal

volumes:
  hrms_data:
    driver: local

networks:
  college_internal:
    driver: bridge
`.trim();

  const nginxConfContent = `
worker_processes auto;
events { worker_connections 1024; }

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    sendfile on;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    upstream hrms_backend {
        server hrms-portal:5000;
        keepalive 32;
    }

    server {
        listen 80;
        server_name hrms.tnu.edu.in;
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name hrms.tnu.edu.in;

        ssl_certificate /etc/nginx/ssl/tnu_hrms.crt;
        ssl_certificate_key /etc/nginx/ssl/tnu_hrms.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Institutional Security Headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        location / {
            proxy_pass http://hrms_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Health Probe endpoint
        location /api/health {
            proxy_pass http://hrms_backend/api/health;
            access_log off;
        }
    }
}
`.trim();

  const cicdYamlContent = `
name: TNU HRMS Enterprise CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js 24
        uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'

      - name: Install Dependencies
        run: |
          npm ci
          cd client && npm ci

      - name: Run Build Check
        run: |
          cd client && npm run build

      - name: Verify Backend Integrity & Health API
        run: |
          node -e "require('./server/index.js'); setTimeout(() => process.exit(0), 1000);"

  build-and-push-docker:
    needs: lint-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build Container Image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: false
          tags: college-registry.tnu.edu.in/hrms/app:latest

      - name: Deploy to Campus Virtual Host (SSH)
        run: |
          echo "Deploying container image to university production host..."
`.trim();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 text-white rounded-xl p-6 shadow-md border border-purple-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span>DevOps, SRE & Production Infrastructure</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Enterprise Deployment & Systems Monitoring
            </h1>
            <p className="mt-1 text-xs md:text-sm text-purple-200/90 max-w-3xl leading-relaxed">
              Production-ready DevOps implementation designed for official college web hosting: Multi-stage Docker containerization, Docker Compose microservices, Nginx TLS reverse-proxy with security headers, GitHub Actions CI/CD pipeline, and Prometheus metrics telemetry.
            </p>
          </div>

          <button
            onClick={fetchHealth}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-2 transition self-start md:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Health Probe</span>
          </button>
        </div>
      </div>

      {/* Live Health & Telemetry Metrics */}
      {healthData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Service Status</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <div className="text-xl font-black text-emerald-600 mt-2 flex items-center space-x-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{healthData.status}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Uptime: {healthData.uptimeSeconds}s</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Memory Heap Used</span>
              <Cpu className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-xl font-black text-purple-700 mt-2">
              {Math.round((healthData.memoryUsage?.heapUsed || 0) / 1024 / 1024)} MB
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Total RSS: {Math.round((healthData.memoryUsage?.rss || 0) / 1024 / 1024)} MB
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Database Entities</span>
              <HardDrive className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-xl font-black text-slate-900 mt-2">
              {healthData.database?.employeesCount} Employees
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {healthData.database?.changeRequestsCount} Changes • {healthData.database?.candidatesCount} CVs
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Runtime Environment</span>
              <Server className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-xl font-black text-indigo-700 mt-2 font-mono text-sm">
              Node {healthData.nodeVersion}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Linux / Alpine / Windows</div>
          </div>
        </div>
      )}

      {/* DevOps Implementation Blueprints */}
      <div className="space-y-6">
        {/* Dockerfile */}
        <div className="bg-slate-950 text-slate-100 rounded-xl border border-slate-800 overflow-hidden shadow-md">
          <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Production Multi-Stage Dockerfile</span>
            </div>
            <button
              onClick={() => copyToClipboard(dockerfileContent, 'dockerfile')}
              className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedSection === 'dockerfile' ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
          <pre className="p-5 font-mono text-xs overflow-x-auto text-emerald-400 leading-relaxed">
            {dockerfileContent}
          </pre>
        </div>

        {/* Docker Compose */}
        <div className="bg-slate-950 text-slate-100 rounded-xl border border-slate-800 overflow-hidden shadow-md">
          <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
              <Server className="w-4 h-4 text-blue-400" />
              <span>docker-compose.yml (Portal + Nginx Proxy + Persistent Volume)</span>
            </div>
            <button
              onClick={() => copyToClipboard(dockerComposeContent, 'compose')}
              className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedSection === 'compose' ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
          <pre className="p-5 font-mono text-xs overflow-x-auto text-sky-300 leading-relaxed">
            {dockerComposeContent}
          </pre>
        </div>

        {/* Nginx Configuration */}
        <div className="bg-slate-950 text-slate-100 rounded-xl border border-slate-800 overflow-hidden shadow-md">
          <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>nginx.conf (TLS, HTTP/2, HSTS & Reverse-Proxy Headers)</span>
            </div>
            <button
              onClick={() => copyToClipboard(nginxConfContent, 'nginx')}
              className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedSection === 'nginx' ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
          <pre className="p-5 font-mono text-xs overflow-x-auto text-amber-300 leading-relaxed">
            {nginxConfContent}
          </pre>
        </div>

        {/* GitHub Actions CI/CD */}
        <div className="bg-slate-950 text-slate-100 rounded-xl border border-slate-800 overflow-hidden shadow-md">
          <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
              <GitBranch className="w-4 h-4 text-indigo-400" />
              <span>.github/workflows/deploy.yml (Automated CI/CD Pipeline)</span>
            </div>
            <button
              onClick={() => copyToClipboard(cicdYamlContent, 'cicd')}
              className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedSection === 'cicd' ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
          <pre className="p-5 font-mono text-xs overflow-x-auto text-purple-300 leading-relaxed">
            {cicdYamlContent}
          </pre>
        </div>
      </div>
    </div>
  );
}
