# Website Source Code Searcher - Complete Guide

## Overview

You now have two tools to search your Webflow website's source code:

1. **Web App** (`website-source-searcher.html`) - Browser-based, no installation needed
2. **CLI Tool** (`website-searcher.js`) - Node.js command-line, more powerful for large sites

---

## 🌐 Web App (Browser Version)

### Quick Start

1. **Open the HTML file** in any modern web browser
   - Double-click `website-source-searcher.html`
   - Or drag it into your browser
   - Or upload to a web server

2. **Enter your website URL**
   - Example: `https://yoursite.webflow.io`
   - Click "Test" to verify connection

3. **Enter search pattern**
   - Plain text: `href=/about`
   - Or regex: `href="?/[a-z]+"`

4. **Choose search type**
   - **Plain Text** - Simple substring matching
   - **Regular Expression** - Complex patterns

5. **Configure options**
   - Case Sensitive: Match exact capitalization
   - Use Sitemap: Auto-crawl all pages from `/sitemap.xml`
   - Max Pages: Limit crawling for safety

6. **Click "Start Search"**
   - Watch progress as it crawls pages
   - View results in real-time

### Features

- ✅ No installation required
- ✅ Automatic sitemap detection
- ✅ Real-time progress tracking
- ✅ Regex support
- ✅ Export results to CSV
- ✅ Beautiful dark UI
- ✅ Works on desktop and mobile

### Search Pattern Examples

```
Plain Text:
  href=/about
  class="button"
  <script src=
  data-track-id
  /api/users

Regular Expression:
  href="?/[a-z]+       (URLs with forward slash)
  <script[^>]*src      (Script tags with src)
  class="[^"]*btn      (Classes containing "btn")
  data-\w+="[^"]*"     (All data attributes)
```

### Limitations

- Browser-based crawling may have CORS restrictions
- Not suitable for very large sites (10,000+ pages)
- May timeout on slow connections

---

## 💻 CLI Tool (Node.js Version)

### Installation

**Prerequisites:**
- Node.js 12+ installed on your computer
- `npm` package manager

**Steps:**

1. **Open terminal/command prompt**

2. **Install dependencies** (one-time setup):
   ```bash
   npm install xml2js
   ```

3. **Make it executable** (macOS/Linux only):
   ```bash
   chmod +x website-searcher.js
   ```

### Usage

#### Basic Search
```bash
node website-searcher.js --url https://yoursite.com --search "href=/about"
```

#### With Options
```bash
# Regex pattern
node website-searcher.js --url https://yoursite.com --search "<script[^>]*src" --regex

# Case-insensitive search
node website-searcher.js --url https://yoursite.com --search "TODO" --case-insensitive

# Don't use sitemap (manual crawl)
node website-searcher.js --url https://yoursite.com --search "password" --no-sitemap

# Increase page limit
node website-searcher.js --url https://yoursite.com --search "api" --max-pages 500

# Export to CSV
node website-searcher.js --url https://yoursite.com --search "old-link" --output results.csv

# Verbose output (detailed logs)
node website-searcher.js --url https://yoursite.com --search "test" --verbose
```

### All Options

```
REQUIRED:
  --url <URL>           Website URL (e.g., https://yoursite.com)
  --search <PATTERN>    Text or regex to find

OPTIONAL:
  --regex               Treat pattern as regex
  --case-insensitive    Ignore case
  --no-sitemap          Don't use sitemap, crawl from homepage
  --max-pages <N>       Maximum pages to crawl (default: 100)
  --output <FILE>       Export results to CSV
  --verbose             Show detailed logging
  --help                Show help message
```

### Real-World Examples

#### Find all links to a specific page
```bash
node website-searcher.js --url https://yoursite.com --search 'href="/contact"'
```

#### Find all external links
```bash
node website-searcher.js --url https://yoursite.com --search 'href="http' --regex
```

#### Find all TODO comments
```bash
node website-searcher.js --url https://yoursite.com --search "TODO" --case-insensitive
```

#### Search for API endpoints
```bash
node website-searcher.js --url https://yoursite.com --search '/api' --max-pages 200
```

#### Find all tracking IDs
```bash
node website-searcher.js --url https://yoursite.com --search 'data-track' --regex --output tracking.csv
```

### CSV Export Format

When you use `--output`, you get a CSV file with:
- **Page URL** - Which page the match was found on
- **Match Count** - How many times it appears on that page
- **Matched Text** - The exact text that matched
- **Sample Preview** - Context around the match

Open in Excel, Google Sheets, or any text editor.

### Features

- ✅ Fast local processing
- ✅ No browser limitations
- ✅ Handle large sites (10,000+ pages)
- ✅ Regex support with full power
- ✅ CSV export
- ✅ Colored terminal output
- ✅ Progress tracking
- ✅ Rate limiting (respectful crawling)

### Troubleshooting

**"command not found: node"**
- Node.js not installed. Download from https://nodejs.org/

**"Cannot find module 'xml2js'"**
- Run: `npm install xml2js`

**Timeout errors**
- Website taking too long to respond
- Try: `node website-searcher.js --help` to see all options

**Too many 404s**
- Sitemap may have dead links
- Use: `--no-sitemap` to crawl manually from homepage

---

## 🎯 Choosing Which Tool

### Use **Web App** if you:
- ✅ Don't want to install anything
- ✅ Want a beautiful visual interface
- ✅ Are searching a small/medium site
- ✅ Prefer point-and-click simplicity
- ✅ Want to share a tool with non-technical team

### Use **CLI Tool** if you:
- ✅ Need to search very large sites
- ✅ Prefer command-line automation
- ✅ Want to schedule searches (cron jobs)
- ✅ Need powerful regex patterns
- ✅ Want to export and process results programmatically
- ✅ Have Node.js already installed

---

## 🔍 Advanced Regex Patterns

### Common Patterns

```regex
# Find all links
href="([^"]*)"

# Find all image sources
src="([^"]*\.(?:png|jpg|jpeg|gif|webp))"

# Find all script tags with external sources
<script[^>]*src="?([^"\s>]+)"?[^>]*>

# Find all CSS classes (for refactoring)
class="([^"]*)"

# Find all data attributes
data-[\w-]+=("[^"]*"|'[^']*')

# Find all URLs
https?://[^\s"'<>]+

# Find all email addresses
[\w\.-]+@[\w\.-]+\.\w+

# Find hard-coded paths
/(?:assets|images|js|css)/[^\s"'<>]*
```

---

## 📋 Common Use Cases

### 1. **Find where a link exists**
```bash
# Web app: Search for "href=/about"
# CLI: node website-searcher.js --url https://site.com --search 'href="/about"'
```

### 2. **Identify old URLs before migration**
```bash
node website-searcher.js --url https://site.com --search "/old-path" --output old-urls.csv
```

### 3. **Find all tracking codes**
```bash
node website-searcher.js --url https://site.com --search "gtag\|analytics\|hotjar" --regex
```

### 4. **Check for broken asset links**
```bash
node website-searcher.js --url https://site.com --search "undefined\|null\|error" --regex
```

### 5. **Find hardcoded values to refactor**
```bash
node website-searcher.js --url https://site.com --search '"#[A-F0-9]{6}"' --regex --output colors.csv
```

### 6. **Security: Find exposed secrets**
```bash
node website-searcher.js --url https://site.com --search "api_key\|secret\|password" --regex
```

---

## 🛡️ Privacy & Safety

- ✅ Both tools run locally (your data stays on your computer)
- ✅ Web app: No data sent to any server
- ✅ CLI tool: Direct connection to your website only
- ✅ Results are not stored anywhere
- ✅ You can inspect the code anytime

---

## ⚡ Performance Tips

### For Large Sites

1. **Increase timeout:**
   - Web app: Just wait longer
   - CLI: Will auto-retry

2. **Limit pages:**
   - Use `--max-pages 200` to test patterns first

3. **Optimize regex:**
   - Test complex patterns on small samples
   - Too complex regex = slower processing

4. **Use sitemap:**
   - Always use sitemap if available
   - Faster than crawling from homepage

### For Frequent Searches

**Create a bash script** (macOS/Linux):
```bash
#!/bin/bash
node website-searcher.js --url "https://yoursite.com" --search "$1" --output "results-$(date +%s).csv"
```

Save as `search.sh`, then:
```bash
chmod +x search.sh
./search.sh "your-pattern"
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Nothing found when you expect results | Check case sensitivity, try plain text instead of regex |
| Too many false positives | Use more specific patterns, enable case sensitivity |
| Slow crawling | Normal - websites can be slow. CLI tool is faster |
| CORS errors in web app | Use CLI tool instead, or upload HTML to a server |
| Regex not matching | Test at https://regex101.com first |
| CSV file is empty | Check that pattern actually exists on site |

---

## 📞 Support

### Getting Help

1. **Web app issues:**
   - Open browser DevTools (F12) → Console tab
   - Look for error messages
   - Try a different search pattern

2. **CLI tool issues:**
   - Run with `--verbose` flag for detailed logs
   - Check that website is accessible: `curl https://yoursite.com`
   - Verify Node.js: `node --version`

3. **Pattern issues:**
   - Test regex at https://regex101.com
   - Start simple, then get complex
   - Use `--verbose` to see what's happening

---

## 🚀 Next Steps

### Automate Your Searches

Create a schedule to run searches periodically:

**macOS/Linux (cron):**
```bash
0 2 * * * cd /path/to/tool && node website-searcher.js --url https://site.com --search "pattern" --output results.csv
```

**Windows (Task Scheduler):**
Create a batch file and schedule it to run daily

### Integration

You can integrate the CLI tool into:
- Build pipelines (CI/CD)
- Automated reports
- Content management systems
- SEO monitoring tools
- Quality assurance workflows

---

## 📝 License

These tools are created for your use. Modify them freely for your needs!

---

## Version History

**v1.0** (May 2026)
- Initial release
- Web app with regex support
- CLI tool with CSV export
- Sitemap auto-detection

