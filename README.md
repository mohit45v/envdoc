# 📖 envdoc

**Beautiful, AI-powered `.env` documentation.**

Tired of undocumented `.env.example` files? `envdoc` is a CLI tool that automatically scans your `.env.example` and your source code to generate a beautiful, categorized `ENV.md` file explaining what every environment variable does, whether it's required, and examples of valid values.

## ✨ Features
- 🚀 **Zero Config**: Just run `npx envdoc` in your project root.
- 🧠 **Smart Dictionary**: Comes with a built-in dictionary of 300+ common environment variables (like `DATABASE_URL` or `STRIPE_SECRET_KEY`) for instant descriptions.
- 🤖 **AI Fallback**: Unknown custom variables are automatically sent to our free AI backend (powered by Gemini) to infer their purpose based on their name. No API key required!
- 📝 **README Integration**: Use the `--readme` flag to append the documentation directly to your existing `README.md`.

## 📦 Installation & Usage

You don't even need to install it. Just run it via `npx`:

```bash
npx envdoc
```

### Options

| Flag | Description |
|------|-------------|
| `-i, --input <file>` | Path to your `.env.example` file (default: `.env.example`) |
| `-o, --output <file>` | Output Markdown file path (default: `ENV.md`) |
| `--readme` | Append the generated section to your `README.md` instead of creating `ENV.md` |
| `--no-ai` | Disable AI fallback for unknown variables (uses only the local dictionary) |
| `--project-name <name>`| Custom project name for the header |

## 🛠️ How it works
1. **Parses** your `.env.example`, extracting keys, default values, and inline comments.
2. **Matches** known variables against an offline dictionary for instantaneous, accurate descriptions.
3. **Calls** the `envdoc` backend API to describe unknown variables using AI.
4. **Generates** a premium Markdown file grouped by categories with emoji badges!

---
*Built with ❤️ for a weekend hackathon.*
