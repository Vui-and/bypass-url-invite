exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { content } = JSON.parse(event.body);
    if (!content) throw new Error("Missing fingerprint content");

    // Token GitHub được lấy từ biến môi trường Netlify
    const TOKEN = process.env.TOKEN;
    if (!TOKEN) throw new Error("Server chưa cấu hình GITHUB_TOKEN");

    const response = await fetch("https://api.github.com/gists", {
      method: "POST",
      headers: {
        "Authorization": `token ${có TOKEN}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "Fingerprint-App"
      },
      body: JSON.stringify({
        description: "Browser fingerprint",
        public: false,
        files: {
          "fingerprint.json": { content }
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`GitHub API error: ${response.status} ${err}`);
    }

    const gistData = await response.json();
    const rawUrl = gistData.files["fingerprint.json"].raw_url;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawUrl })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
