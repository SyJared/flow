const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL;

const aiSummary = async (prompt) => {
  const response = await fetch(
    `${OLLAMA_BASE_URL}/api/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen2.5:3b",
        prompt,
        stream: false
      })
    }
  );

  return await response.json();
};

module.exports = aiSummary