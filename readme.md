# **CloudsineAI: WebTest Take-Home Assignment**

*"Clean code always looks like it was written by someone who cares."*  
— **Robert C. Martin**, *Author of Clean Code*

Welcome to the CloudsineAI take-home assignment! This project will help us evaluate your coding skills, problem-solving abilities, and design process. Let's get started!

---

## **Objective**
The goal of this assignment is to create a functional web application with GenAI hosted on **AWS EC2**. The application will integrate with the VirusTotal API to securely upload and scan files for malware or viruses.  Integrate with a free GenAI app such as Gemini API to explain the results to a lay end user.  

---

## **Features**
1. **File Upload and Scanning**: Build a web interface that allows users to upload files and scan them using the [VirusTotal API](https://docs.virustotal.com/reference/overview).
2. **Result Display**: Present the scan results dynamically and clearly on the webpage.
3. **GenAI Integration**: Integrate with a LLM to explain the results to a lay end user
4. **Customizable Design**: Add enhancements or optimizations to showcase your skills.

---

## **Assignment Steps**

### **Step 1: Set Up the Web Server on EC2**
1. Launch an **AWS EC2 instance** to host your web application:
   - Choose an appropriate instance type (e.g., t2.micro under the free tier) and configure the security group for web traffic (HTTP/HTTPS).  
   - Install and configure your preferred web server software, such as **Apache**, **NGINX**, or any other of your choice.
2. Ensure the instance is properly configured and accessible for hosting the web application.

---

### **Step 2: Develop the Web Application**
1. **Core Functionality**:
   - Implement a **file upload** feature with basic validation (e.g., file size/type).
   - Integrate with the VirusTotal API to scan the uploaded files.
   - Dynamically display the scan results on the webpage.
2. **Preferred Programming Languages**:
   - While **Golang** or **Python** are preferred, you may use any language or framework you are comfortable with.
3. **Security Considerations**:
   - Handle file uploads securely to prevent malicious file execution.
   - Sanitize API requests and responses.

---

### **Step 3: Test with Sample Files**
1. Use the provided sample files in this repository to test your application.
2. Verify that the scan results are displayed correctly after processing by the VirusTotal API.

---

## **Example Workflow**
1. A user uploads a file through the web interface.
2. The file is sent to the VirusTotal API for scanning.  
3. The API processes the file and returns the results.  
4. The scan results are displayed on the webpage in a user-friendly format.
5. Include a button where the GenAI can elaborate on the scan results to a lay end user.

---

## **Bonus Section: Optional Enhancements**
Go the extra mile by implementing one or both of the following:

### **1. Dockerization**
- Create separate **Dockerfiles** for development and production environments.
- Use **Docker Compose** to manage multi-container setups (e.g., integrating a PostgreSQL database).
- Optimize image sizes and configurations for faster deployments.

### **2. CI/CD Pipeline**
- Automate testing and deployments using a CI/CD pipeline (e.g., GitHub Actions or AWS CodePipeline).
- Include integration tests to ensure file uploads and VirusTotal API calls function correctly.
- Securely manage environment variables and secrets using tools like AWS Secrets Manager.

---

## **Evaluation Criteria**
You are free to use AI code assistants such as Cursor and Claude Code.  However, you are expected to be able to understand and explain most of the code.  

Your submission will be assessed on:
1. **Functionality**: Does the application meet the core requirements?  
2. **Code Quality**: Is the code modular, maintainable, and well-documented?  
3. **Problem-Solving**: How effectively did you address challenges and errors?  
4. **Creativity**: Did you add enhancements or optimizations to improve the application?  
5. **Presentation**: Is the solution polished and user-friendly?  

---

## **Resources**
- [AWS EC2 Getting Started Guide](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/get-set-up-for-amazon-ec2.html)  
- [VirusTotal API Documentation](https://docs.virustotal.com/reference/overview)  
- [PostgreSQL Quick Start Guide](https://www.postgresql.org/docs/current/tutorial.html)  
- [Gemini API Docs] https://ai.google.dev/gemini-api/docs
---

## **Submission Requirements**
1. **Documentation**:
   - Provide a detailed README explaining your setup process, challenges, and solutions.  
2. **Source Code**:
   - Share your codebase with clear instructions for running the application.  
3. **Deployment**:
   - Host your application on AWS EC2 and provide access for review.  
4. **Discussion**:
   - Be prepared to discuss your design choices, challenges faced, and any enhancements implemented.

---

## **Getting Started**
1. Clone this repository and review the provided sample files.  
2. Set up your AWS EC2 instance and deploy the web application.  
3. Test the file upload and VirusTotal integration locally before deploying it to AWS.

---

We look forward to seeing your innovative solutions and thoughtful designs!  
**CloudsineAI Team**  


### Current Progress: 
- Backend: Basic Routes Done 
   - 1. POST /vt/upload/complete (Upload a file to VT datastores to get checked by 70+ antivirus tools)
   - 2. POST /vt/upload-quick (Upload the file's hash to VT, for a preliminary analysis after cross-checking with similar historical results)
   - 3. GET /vt/analysis/{filename} (Get the analysis state for a given file that was uploaded completely to VT datastore.)

---

## Project Overview

- **Frontend:** React + TypeScript (Vite) housed in `client/` with Material UI for visuals.
- **Backend:** FastAPI service in `backend/` orchestrating uploads to VirusTotal plus GenAI explanations.
- **Caching:** Redis stores file UUID mappings, pending analysis IDs, and cached VT responses.
- **Packaging:** Dockerfiles for each service plus a Compose stack to wire everything together.

Refer to [README_instructions.md](README_instructions.md) for the full operational playbook.

## Getting Started (Local Development)

1. **Install prerequisites**
   - Node.js ≥ 20
   - Python ≥ 3.11
   - Redis (only if you run the backend outside Docker)

2. **Configure environment variables**
   ```bash
   cp backend/.env.example backend/.env
   cp client/.env.example client/.env
   # fill in VT/OpenAI keys and Redis password before running services
   ```

3. **Run backend**
   ```bash
   cd backend
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```

4. **Run frontend**
   ```bash
   cd client
   npm install
   npm run dev -- --host 0.0.0.0 --port 5173
   ```

## Docker & Compose Workflows

1. **Build standalone images**
   ```bash
   docker build -t protocyber-backend -f backend/Dockerfile backend
   docker build -t protocyber-frontend -f client/Dockerfile client
   ```

2. **Bring up the full stack**
   ```bash
   export VT_API_KEY=...
   export OPENAI_API_KEY=...
   export REDIS_PASSWORD=supersecure
   docker compose up --build
   ```
   - Backend → http://localhost:8000
   - Frontend → http://localhost:4173
   - Redis → localhost:6379 (password protected via env vars)

3. **Tear down**
   ```bash
   docker compose down
   ```

## Deployment on AWS EC2 (High Level)

1. Launch Amazon Linux 2023 instance (t3.small recommended) and install Docker + Compose.
2. Pull this repo (or docker images from a registry) onto the instance.
3. Copy production `.env` files (not committed) and run `docker compose up -d --build`.
4. Harden security groups, add HTTPS (ACM + ALB or Nginx reverse proxy), and monitor via CloudWatch.

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) now runs on every push / pull request:
1. **Backend job** – installs Python deps and compiles the FastAPI project to catch syntax errors early.
2. **Frontend job** – runs `npm ci` + `npm run build` to ensure the Vite build stays green.
3. **Docker build job** – builds backend & frontend images to validate Dockerfiles.

Extend the pipeline with deploy jobs once you’re ready to push images to ECR / update EC2 automatically.

## Security Notes

- Rotate any API keys that were ever committed (VirusTotal, OpenAI). Generate new keys in their respective portals, update your local `.env`, and revoke/delete the exposed ones.
- Keep `.env` files out of git; only `.env.example` templates live in the repo.
- Redis is internal to Docker Compose and password protected; if you expose it, gate access via security groups or TLS.
