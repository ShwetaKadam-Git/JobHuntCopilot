import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const cv = formData.get("cv") as File | null;
    const coverLetter = formData.get("coverLetter") as File | null;
    const jobUrl = formData.get("jobUrl") as string | null;

    if (!cv || !coverLetter || !jobUrl) {
      return NextResponse.json(
        { error: "Missing required fields: cv, coverLetter, or jobUrl" },
        { status: 400 }
      );
    }

    // Extract file contents
    const cvText = await cv.text();
    const coverLetterText = await coverLetter.text();

    // For now, return a mock analysis response
    // In production, you would send this data to your actual AI analysis service
    const analysisResult = {
      matchScore: 78,
      summary: `Analysis of your application for the position at ${new URL(jobUrl).hostname}. Your CV and cover letter have been reviewed against the job requirements.`,
      strengths: [
        "Strong technical skills alignment with job requirements",
        "Clear demonstration of relevant experience",
        "Well-structured cover letter with compelling narrative",
      ],
      improvements: [
        "Consider adding more quantifiable achievements",
        "Tailor technical keywords to match job description",
        "Strengthen the opening paragraph of cover letter",
      ],
      suggestions: [
        "Add metrics to demonstrate impact in previous roles",
        "Include specific technologies mentioned in the job posting",
        "Consider reorganizing skills section for better visibility",
      ],
      filesReceived: {
        cv: {
          name: cv.name,
          size: cv.size,
          contentPreview: cvText.substring(0, 100) + "...",
        },
        coverLetter: {
          name: coverLetter.name,
          size: coverLetter.size,
          contentPreview: coverLetterText.substring(0, 100) + "...",
        },
      },
      jobUrl: jobUrl,
    };

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process the analysis request" },
      { status: 500 }
    );
  }
}
