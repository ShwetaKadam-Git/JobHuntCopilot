from flask import Flask, request, jsonify
import pdfplumber
from docx import Document
import tempfile
import os
import requests
from bs4 import BeautifulSoup
from groq import Groq
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

print(" SERVER STARTING...")

# =========================
# GROQ SETUP
# =========================
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
 raise ValueError(" GROQ_API_KEY not set")

client = Groq(api_key=api_key)

print(" Groq client initialized")


# =========================
# FILE PARSERS
# =========================
def parse_pdf(file_path):
 print(" Parsing PDF:", file_path)
 text = []
 with pdfplumber.open(file_path) as pdf:
 for page in pdf.pages:
 text.append(page.extract_text() or "")
 return "\n".join(text)


def parse_docx(file_path):
 print(" Parsing DOCX:", file_path)
 doc = Document(file_path)
 return "\n".join([p.text for p in doc.paragraphs])


def parse_file(file_storage):
 filename = file_storage.filename.lower()
 print(" Received file:", filename)

 with tempfile.NamedTemporaryFile(delete=False) as tmp:
 file_storage.save(tmp.name)
 temp_path = tmp.name

 try:
 if filename.endswith(".pdf"):
 return parse_pdf(temp_path)
 elif filename.endswith(".docx"):
 return parse_docx(temp_path)
 else:
 raise ValueError("Unsupported file type")
 finally:
 os.remove(temp_path)
 print(" Temp file removed")


# =========================
# JOB PARSER
# =========================
HEADERS = {"User-Agent": "Mozilla/5.0"}

def parse_job_url(url):
 print(" Fetching job URL:", url)

 response = requests.get(url, headers=HEADERS)
 print(" Status Code:", response.status_code)

 if response.status_code != 200:
 raise Exception(f"Failed to fetch URL: {response.status_code}")

 soup = BeautifulSoup(response.text, "lxml")

 linkedin_desc = soup.find("div", {"class": "description__text"})
 if linkedin_desc:
 text = linkedin_desc.get_text(separator="\n").strip()
 print(" LinkedIn-style extraction success")
 return text

 paragraphs = soup.find_all("p")
 text = "\n".join([p.get_text() for p in paragraphs])

 if not text.strip():
 print(" No job text found")
 raise Exception("Could not extract job description")

 print(" Generic extraction success")
 return text.strip()


# =========================
# GROQ ANALYZER
# =========================
def analyze_application(cv_text, cover_text, job_text):

 print(" Sending data to Groq...")
 print("CV length:", len(cv_text))
 print("Cover length:", len(cover_text))
 print("Job length:", len(job_text))

 prompt = f"""
You are an expert resume and cover letter optimizer.

CV:
\"\"\"{cv_text}\"\"\"

Cover Letter:
\"\"\"{cover_text}\"\"\"

Job Description:
\"\"\"{job_text}\"\"\"

Return ONLY JSON:
{{
 "match_score": "0-100",
 "cv_analysis": {{
 "missing_keywords": [],
 "skills_to_add": [],
 "experience_improvements": [],
 "ats_tips": []
 }},
 "cover_letter_analysis": {{
 "issues": [],
 "improvements": [],
 "rewritten_cover_letter": ""
 }},
 "job_alignment": {{
 "strengths": [],
 "gaps": [],
 "recommendations": []
 }},
 "general_feedback": []
}}
"""

 response = client.chat.completions.create(
 model="qwen/qwen3-32b",
 messages=[
 {"role": "system", "content": "You are a career optimization AI."},
 {"role": "user", "content": prompt}
 ],
 temperature=0.3
 )

 content = response.choices[0].message.content

 print(" Raw Groq response received")

 try:
 parsed = json.loads(content)
 print(" JSON parsing success")
 return parsed
 except Exception as e:
 print(" JSON parsing failed:", str(e))
 print("RAW OUTPUT:\n", content)
 return {"error": "Invalid JSON", "raw": content}


# =========================
# MAIN API
# =========================
@app.route("/api/analyze-cv", methods=["POST"])
def analyze_cv():

 print("\n NEW REQUEST RECEIVED")

 try:
 if "cv" not in request.files:
 print(" CV missing")
 return jsonify({"error": "CV missing"}), 400

 if "cover_letter" not in request.files:
 print(" Cover letter missing")
 return jsonify({"error": "Cover letter missing"}), 400

 if "url" not in request.form:
 print(" URL missing")
 return jsonify({"error": "Job URL missing"}), 400

 cv_file = request.files["cv"]
 cover_file = request.files["cover_letter"]
 url = request.form["url"]

 print(" Inputs received")

 cv_text = parse_file(cv_file)
 print(" CV parsed")

 cover_text = parse_file(cover_file)
 print(" Cover letter parsed")

 job_text = parse_job_url(url)
 print(" Job parsed")

 result = analyze_application(cv_text, cover_text, job_text)

 print(" Analysis complete")

 return jsonify({
 "status": "success",
 "result": result
 })

 except Exception as e:
 print(" ERROR OCCURRED:", str(e))
 return jsonify({
 "status": "error",
 "message": str(e)
 }), 500


# =========================
# RUN SERVER
# =========================
if __name__ == "__main__":
 print(" Flask running on http://127.0.0.1:5000")
 app.run(debug=True)