#!/usr/bin/env node

/**
 * Website Source Code Searcher - CLI Tool
 *
 * Usage:
 *   node website-searcher.js --url https://example.com --search "pattern" [options]
 *
 * Examples:
 *   node website-searcher.js --url https://example.com --search "href=/about"
 *   node website-searcher.js --url https://example.com --search 'class="btn"' --regex
 *   node website-searcher.js --url https://example.com --search "<script" --output results.csv
 */

const https = require("https");
const http = require("http");
const { URL } = require("url");
const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    url: null,
    search: null,
    regex: false,
    caseSensitive: true,
    useSitemap: true,
    sitemapFile: null,
    maxPages: 200,
    maxMatches: 10,
    output: null,
    verbose: false,
    timeout: 10000,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--url" && i + 1 < args.length) {
      options.url = args[++i];
    } else if (arg === "--search" && i + 1 < args.length) {
      options.search = args[++i];
    } else if (arg === "--regex") {
      options.regex = true;
    } else if (arg === "--case-insensitive") {
      options.caseSensitive = false;
    } else if (arg === "--sitemap-file" && i + 1 < args.length) {
      options.sitemapFile = args[++i];
    } else if (arg === "--no-sitemap") {
      options.useSitemap = false;
    } else if (arg === "--max-pages" && i + 1 < args.length) {
      options.maxPages = parseInt(args[++i]) || 100;
    } else if (arg === "--output" && i + 1 < args.length) {
      options.output = args[++i];
    } else if (arg === "--verbose") {
      options.verbose = true;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
${colors.bright}Website Source Code Searcher${colors.reset}

${colors.cyan}USAGE:${colors.reset}
  node website-searcher.js --url <URL> --search <PATTERN> [OPTIONS]

${colors.cyan}REQUIRED:${colors.reset}
  --url <URL>           Website URL to search (e.g., https://example.com)
  --search <PATTERN>    Text or regex pattern to search for

${colors.cyan}OPTIONS:${colors.reset}
  --regex               Treat search pattern as regex
  --case-insensitive    Case-insensitive search
  --sitemap-file <FILE> Use local sitemap file (XML or plain text URLs)
  --no-sitemap          Don't use sitemap, crawl from homepage
  --max-pages <N>       Maximum pages to crawl (default: 100)
  --output <FILE>       Export results to CSV file
  --verbose             Show detailed logging
  --help, -h            Show this help message

${colors.cyan}EXAMPLES:${colors.reset}
  # Search for links to /about page
  node website-searcher.js --url https://example.com --search "href=/about"

  # Use local sitemap file
  node website-searcher.js --url https://example.com --search "test" --sitemap-file ./sitemap.xml

  # Use plain text file with URLs
  node website-searcher.js --url https://example.com --search "test" --sitemap-file ./urls.txt

  # Use regex to find all script sources
  node website-searcher.js --url https://example.com --search "<script[^>]*src" --regex

  # Case-insensitive search for buttons
  node website-searcher.js --url https://example.com --search 'class="btn' --case-insensitive

  # Export results to CSV
  node website-searcher.js --url https://example.com --search "TODO" --output results.csv
    `);
}

async function fetchUrl(urlString) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(urlString);
    const client = urlObj.protocol === "https:" ? https : http;
    const timeout = 10000;

    const request = client.get(urlString, { timeout }, (response) => {
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        resolve(data);
      });
    });

    request.on("error", reject);
    request.on("timeout", () => {
      request.destroy();
      reject(new Error("Request timeout"));
    });
  });
}

async function fetchSitemap(baseUrl) {
  try {
    const sitemapUrl = new URL("/sitemap.xml", baseUrl).toString();
    const xmlData = await fetchUrl(sitemapUrl);

    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlData);

    const urls = result.urlset.url.map((item) => item.loc[0]);
    return urls;
  } catch (error) {
    console.warn(
      `${colors.yellow}⚠  Could not fetch sitemap: ${error.message}${colors.reset}`,
    );
    return [];
  }
}

function parseSitemapFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");

    // Try to parse as XML first
    if (content.includes("<?xml") || content.includes("<urlset")) {
      let urls = [];
      const parser = new xml2js.Parser();

      parser.parseString(content, (err, result) => {
        if (!err && result && result.urlset && result.urlset.url) {
          urls = result.urlset.url.map((item) => item.loc[0]);
        }
      });

      if (urls.length > 0) {
        return urls;
      }
    }

    // Otherwise treat as plain text - one URL per line
    const urls = content
      .split("\n")
      .map((line) => line.trim())
      .filter(
        (line) =>
          line.length > 0 &&
          (line.startsWith("http://") || line.startsWith("https://")),
      );

    return urls;
  } catch (error) {
    throw new Error(`Could not parse sitemap file: ${error.message}`);
  }
}

function searchInContent(html, pattern, isRegex, caseSensitive) {
  const matches = [];

  try {
    let regex;
    if (isRegex) {
      const flags = caseSensitive ? "g" : "gi";
      regex = new RegExp(pattern, flags);
    } else {
      const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const flags = caseSensitive ? "g" : "gi";
      regex = new RegExp(escapedPattern, flags);
    }

    let match;
    while ((match = regex.exec(html)) !== null) {
      const start = Math.max(0, match.index - 60);
      const end = Math.min(html.length, match.index + match[0].length + 60);
      const preview = html.substring(start, end).replace(/\n/g, " ").trim();

      matches.push({
        text: match[0],
        preview: preview,
        index: match.index,
        line: getLineNumber(html, match.index),
      });
    }
  } catch (error) {
    throw new Error(`Invalid regex pattern: ${error.message}`);
  }

  return matches;
}

function getLineNumber(text, index) {
  return text.substring(0, index).split("\n").length;
}

function formatMatch(match, searchPattern) {
  return `
    ${colors.yellow}Match:${colors.reset} ${colors.bright}${match.text}${colors.reset}
    ${colors.dim}Line: ${match.line} | Preview: ...${match.preview.substring(0, 80)}...${colors.reset}`;
}

function exportToCSV(results, filename) {
  let csv = "Page URL,Match Count,Matched Text,Sample Preview\n";

  results.forEach((result) => {
    result.matches.forEach((match) => {
      const preview = match.preview.replace(/"/g, '""').substring(0, 100);
      csv += `"${result.url}",${result.matches.length},"${match.text.replace(/"/g, '""')}","${preview}"\n`;
    });
  });

  fs.writeFileSync(filename, csv);
}

async function main() {
  const options = parseArgs();

  // Validate required options
  if (!options.url || !options.search) {
    console.error(
      `${colors.red}✗ Error: --url and --search are required${colors.reset}`,
    );
    console.log(`\nRun with --help for more information`);
    process.exit(1);
  }

  try {
    const urlObj = new URL(options.url);
    const baseUrl = urlObj.origin;

    console.log(`
${colors.bright}${colors.blue}Website Source Code Searcher${colors.reset}
${colors.dim}─ ${baseUrl} ${colors.reset}`);

    console.log(`
${colors.cyan}Configuration:${colors.reset}
  • Search Pattern: ${colors.bright}${options.search}${colors.reset}
  • Pattern Type: ${options.regex ? "Regular Expression" : "Plain Text"}
  • Case Sensitive: ${options.caseSensitive ? "Yes" : "No"}
  • Use Sitemap: ${options.useSitemap ? "Yes" : "No"}
  • Max Pages: ${options.maxPages}
`);

    // Fetch list of pages to crawl
    let pagesToCrawl = [];

    if (options.sitemapFile) {
      console.log(
        `${colors.cyan}Reading sitemap file: ${options.sitemapFile}...${colors.reset}`,
      );
      try {
        pagesToCrawl = parseSitemapFile(options.sitemapFile);
        console.log(
          `${colors.green}✓${colors.reset} Loaded ${colors.bright}${pagesToCrawl.length}${colors.reset} URLs from file\n`,
        );
      } catch (error) {
        console.error(
          `${colors.red}✗ Error reading sitemap file: ${error.message}${colors.reset}`,
        );
        process.exit(1);
      }
    } else if (options.useSitemap) {
      console.log(
        `${colors.cyan}Fetching sitemap from website...${colors.reset}`,
      );
      pagesToCrawl = await fetchSitemap(baseUrl);

      if (pagesToCrawl.length === 0) {
        console.log(
          `${colors.yellow}No pages found in sitemap, using homepage${colors.reset}`,
        );
        pagesToCrawl = [options.url];
      }
    } else {
      pagesToCrawl = [options.url];
    }

    pagesToCrawl = pagesToCrawl.slice(0, options.maxPages);
    console.log(
      `${colors.green}✓${colors.reset} Found ${colors.bright}${pagesToCrawl.length}${colors.reset} page${pagesToCrawl.length !== 1 ? "s" : ""} to crawl\n`,
    );

    // Crawl and search
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < pagesToCrawl.length; i++) {
      const pageUrl = pagesToCrawl[i];
      process.stdout.write(
        `${colors.cyan}[${i + 1}/${pagesToCrawl.length}]${colors.reset} ${pageUrl.substring(0, 80)}... `,
      );

      try {
        const html = await fetchUrl(pageUrl);
        const matches = searchInContent(
          html,
          options.search,
          options.regex,
          options.caseSensitive,
        );

        if (matches.length > 0) {
          results.push({
            url: pageUrl,
            matches: matches.slice(0, options.maxMatches),
          });
          process.stdout.write(
            `${colors.green}✓${colors.reset} ${colors.bright}${matches.length}${colors.reset} match${matches.length !== 1 ? "es" : ""}\n`,
          );
        } else {
          process.stdout.write(`${colors.dim}–${colors.reset}\n`);
        }
        successCount++;
      } catch (error) {
        process.stdout.write(
          `${colors.red}✗${colors.reset} ${colors.dim}${error.message}${colors.reset}\n`,
        );
        errorCount++;
      }

      // Rate limiting - small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Display results
    console.log(`
${colors.bright}${colors.cyan}Search Results${colors.reset}
${colors.dim}─────────────────────${colors.reset}`);

    if (results.length === 0) {
      console.log(`\n${colors.yellow}No matches found.${colors.reset}`);
    } else {
      console.log(
        `\n${colors.green}✓${colors.reset} Found matches on ${colors.bright}${results.length}${colors.reset} page${results.length !== 1 ? "s" : ""}\n`,
      );

      results.forEach((result, index) => {
        console.log(
          `${colors.bright}${index + 1}. ${result.url}${colors.reset}`,
        );
        console.log(
          `   ${colors.dim}${result.matches.length} match${result.matches.length !== 1 ? "es" : ""}${colors.reset}`,
        );

        result.matches.slice(0, 3).forEach((match) => {
          console.log(
            `   ${colors.yellow}→${colors.reset} ${colors.bright}${match.text}${colors.reset}`,
          );
          console.log(
            `     ${colors.dim}Line ${match.line}: ...${match.preview.substring(0, 70)}...${colors.reset}`,
          );
        });

        if (result.matches.length > 3) {
          console.log(
            `   ${colors.dim}... and ${result.matches.length - 3} more matches${colors.reset}`,
          );
        }
        console.log();
      });
    }

    // Summary
    const totalMatches = results.reduce((sum, r) => sum + r.matches.length, 0);
    console.log(`${colors.bright}${colors.cyan}Summary${colors.reset}`);
    console.log(`${colors.dim}─────────────────────${colors.reset}`);
    console.log(
      `  Pages Crawled: ${colors.bright}${successCount}${colors.reset}`,
    );
    console.log(
      `  Errors: ${errorCount > 0 ? colors.red + errorCount + colors.reset : colors.green + "0" + colors.reset}`,
    );
    console.log(
      `  Pages with Matches: ${colors.bright}${results.length}${colors.reset}`,
    );
    console.log(
      `  Total Matches: ${colors.bright}${totalMatches}${colors.reset}`,
    );

    // Export if requested
    if (options.output) {
      exportToCSV(results, options.output);
      console.log(
        `\n${colors.green}✓${colors.reset} Results exported to ${colors.bright}${options.output}${colors.reset}`,
      );
    }

    console.log();
  } catch (error) {
    console.error(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

main();
