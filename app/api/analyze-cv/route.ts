import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const cv = formData.get("cv") as File | null;
    const coverLetter = formData.get("cover_letter") as File | null;
    const jobUrl = formData.get("url") as string | null;

    if (!cv || !coverLetter || !jobUrl) {
      return NextResponse.json(
        { error: "Missing required fields: cv, cover_letter, or url" },
        { status: 400 }
      );
    }

    // Get the Flask backend URL from environment variable, fallback to localhost
    const backendUrl = process.env.FLASK_BACKEND_URL || "http://127.0.0.1:5000";

    // Forward the request to the Flask backend
    const flaskFormData = new FormData();
    flaskFormData.append("cv", cv);
    flaskFormData.append("cover_letter", coverLetter);
    flaskFormData.append("url", jobUrl);

    const response = await fetch(`${backendUrl}/api/analyze-cv`, {
      method: "POST",
      body: flaskFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          status: "error",
          message: errorData.error || errorData.message || "Failed to analyze application" 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { 
        status: "error",
        message: error instanceof Error ? error.message : "Failed to process the analysis request" 
      },
      { status: 500 }
    );
  }
}
