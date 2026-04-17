#!/usr/bin/env node
import { Command } from "commander";
import * as path from "path";
import * as fs from "fs";
import ora from "ora";
import chalk from "chalk";
import { parseEnvFile } from "./parser.js";
import { matchVars } from "./matcher.js";
import { describeWithAI } from "./ai.js";
import { generateMarkdown, generateReadmeSection } from "./generator.js";

const program = new Command();

program
  .name("envdoc")
  .description("Auto-document your .env.example into a beautiful ENV.md")
  .version("0.1.0")
  .option("-i, --input <file>", "Path to .env.example file", ".env.example")
  .option("-o, --output <file>", "Output file path", "ENV.md")
  .option("--readme", "Append/update a section in README.md instead of creating ENV.md")
  .option("--no-ai", "Skip AI descriptions (use dictionary + comments only)")
  .option("--project-name <name>", "Project name shown in the header")
  .option("-d, --dir <path>", "Root directory to scan for source files", ".")
  .action(async (options) => {
    console.log(chalk.bold.cyan("\n  envdoc") + chalk.gray(" — .env documenter\n"));

    const rootDir = path.resolve(options.dir);
    const inputFile = path.resolve(options.input);
    const outputFile = options.readme
      ? path.resolve("README.md")
      : path.resolve(options.output);

    // ── 1. Parse .env.example ────────────────────────────────
    const spinner = ora("Parsing .env.example...").start();

    let entries: any[] = [];
    try {
      entries = parseEnvFile(inputFile);
      spinner.succeed(chalk.green(`Parsed ${inputFile}`));
    } catch (err: any) {
      spinner.fail(chalk.red(`Could not read ${inputFile}: ${err.message}`));
      process.exit(1);
    }

    // ── 2. Match against dictionary + scan source ────────────
    const matchSpinner = ora("Matching variables...").start();
    const matched = matchVars(entries, rootDir);

    const dictHits = matched.filter((v) => v.dictionaryMatch).length;
    const needAI = matched.filter((v) => v.needsAI);
    matchSpinner.succeed(
      chalk.green(`Matched ${dictHits}/${matched.length} vars from dictionary`) +
      (needAI.length > 0 ? chalk.yellow(` · ${needAI.length} need AI description`) : "")
    );

    // ── 3. AI descriptions for unknowns ──────────────────────
    const aiDescriptions = new Map();
    if (options.ai !== false && needAI.length > 0) {
      const aiSpinner = ora(`Getting AI descriptions for ${needAI.length} unknown vars...`).start();
      try {
        const descriptions = await describeWithAI(needAI);
        descriptions.forEach((v, k) => aiDescriptions.set(k, v));
        aiSpinner.succeed(chalk.green(`Got AI descriptions for ${descriptions.size} vars`));
      } catch {
        aiSpinner.warn(chalk.yellow("AI descriptions unavailable — using fallback"));
      }
    }

    // ── 4. Generate output ───────────────────────────────────
    const genSpinner = ora("Generating documentation...").start();

    const projectName =
      options.projectName ||
      (() => {
        try {
          const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf-8"));
          return pkg.name || path.basename(rootDir);
        } catch {
          return path.basename(rootDir);
        }
      })();

    let content: string;

    if (options.readme) {
      let readmeContent = "";
      if (fs.existsSync(outputFile)) {
        readmeContent = fs.readFileSync(outputFile, "utf-8");
      }
      const section = generateReadmeSection(matched, aiDescriptions);

      // replace existing section or append
      if (readmeContent.includes("<!-- envdoc:start -->")) {
        content = readmeContent.replace(
          /<!-- envdoc:start -->[\s\S]*?<!-- envdoc:end -->/,
          section
        );
      } else {
        content = readmeContent + "\n\n" + section;
      }
    } else {
      content = generateMarkdown(matched, aiDescriptions, {
        projectName,
        outputMode: "file",
      });
    }

    fs.writeFileSync(outputFile, content, "utf-8");
    genSpinner.succeed(chalk.green(`Written to ${outputFile}`));

    // ── 5. Summary ───────────────────────────────────────────
    console.log("");
    console.log(chalk.bold("  Summary"));
    console.log(chalk.gray("  ───────────────────────────────"));
    console.log(`  ${chalk.cyan("Variables documented:")} ${matched.length}`);
    console.log(`  ${chalk.cyan("From dictionary:")}      ${dictHits}`);
    console.log(`  ${chalk.cyan("From AI:")}              ${aiDescriptions.size}`);
    console.log(`  ${chalk.cyan("From .env comments:")}   ${matched.filter(v => v.existingComment && !v.dictionaryMatch).length}`);
    console.log(`  ${chalk.cyan("Output:")}               ${outputFile}`);
    console.log("");
    console.log(chalk.bold.green("  ✓ Done!\n"));
  });

program.parse();
