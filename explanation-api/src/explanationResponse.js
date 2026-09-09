export function parseExplanationResponse(text, expertiseLevel, providerName = "Model") {
  try {
    const parsed = JSON.parse(stripMarkdownFence(text));
    if (typeof parsed.answer !== "string" || !Array.isArray(parsed.limitations))
      throw new Error(`${providerName} returned an invalid explanation shape`);

    const limitations = parsed.limitations.filter((item) => typeof item === "string");
    return {
      answer: parsed.answer,
      limitations: expertiseLevel === "beginner" ? limitations.slice(0, 2) : limitations
    };
  } catch (error) {
    const parseError = new Error(`${providerName} returned an invalid JSON explanation`);
    parseError.cause = error;
    parseError.statusCode = 502;
    throw parseError;
  }
}

function stripMarkdownFence(text) {
  if (typeof text !== "string")
    return text;

  const match = text.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return match ? match[1] : text;
}
