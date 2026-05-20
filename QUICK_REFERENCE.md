# Quick Reference Guide

## 🚀 5-Minute Start

### Web App
1. Open `website-source-searcher.html` in browser
2. Enter website URL
3. Enter search pattern
4. Click "Start Search"
5. View results & export CSV

### CLI Tool
1. Install: `npm install xml2js`
2. Run: `node website-searcher.js --url https://site.com --search "pattern"`

---

## 📚 Common Commands

### Find Links to a Page
```bash
# Web app: Search for: href="/about"
# CLI:
node website-searcher.js --url https://site.com --search 'href="/about"'
```

### Find All External Links
```bash
# CLI (regex mode):
node website-searcher.js --url https://site.com --search 'href="https' --regex
```

### Find Old URLs Before Migration
```bash
# CLI (save results):
node website-searcher.js --url https://site.com --search "/old" --output migration.csv
```

### Find All Classes (for CSS refactoring)
```bash
# CLI (regex):
node website-searcher.js --url https://site.com --search 'class="([^"]*)"' --regex
```

### Find Data Attributes
```bash
# CLI (regex):
node website-searcher.js --url https://site.com --search 'data-' --regex
```

### Find Tracking Codes
```bash
# CLI (regex):
node website-searcher.js --url https://site.com --search 'gtag|analytics|hotjar' --regex
```

### Find Hard-coded Paths
```bash
# CLI:
node website-searcher.js --url https://site.com --search '/assets/' --max-pages 200
```

---

## 🎯 Regex Patterns

| Need | Pattern | Example |
|------|---------|---------|
| Specific page links | `href="/page"` | `href="/contact"` |
| External links | `href="https` | Find all http/https |
| Image sources | `src=".*\.(png\|jpg\|gif)"` | All image files |
| CSS classes | `class="[^"]*"` | All class attributes |
| Data attributes | `data-\w+` | All data-* attributes |
| URLs | `https?://\S+` | All URLs |
| Emails | `\w+@\w+\.\w+` | Email addresses |
| Phone numbers | `\d{3}-?\d{3}-?\d{4}` | Phone formats |

---

## ⚙️ CLI Options Reference

```
Essential:
  --url <URL>              Your website URL
  --search <PATTERN>       What to search for

Search Type:
  --regex                  Pattern is regex (default: plain text)
  --case-insensitive       Ignore uppercase/lowercase

Crawling:
  --max-pages <N>          Limit pages crawled (default: 100)
  --no-sitemap             Crawl from homepage instead of sitemap

Output:
  --output <FILE>          Save results to CSV
  --verbose                Show detailed logs

Help:
  --help                   Show all options
```

---

## 🔍 Search Examples By Use Case

### Content Audit
```bash
# Find all links
node website-searcher.js --url https://site.com --search 'href=' --max-pages 50 --output links.csv

# Find all images
node website-searcher.js --url https://site.com --search 'src=' --max-pages 50 --output images.csv

# Find headings
node website-searcher.js --url https://site.com --search '<h[1-6]' --regex --output headings.csv
```

### SEO Checks
```bash
# Find meta descriptions
node website-searcher.js --url https://site.com --search 'name="description"' --output meta.csv

# Find canonical tags
node website-searcher.js --url https://site.com --search 'rel="canonical"' --output canonical.csv

# Find alt text
node website-searcher.js --url https://site.com --search 'alt=' --output alt-text.csv
```

### Quality Assurance
```bash
# Find console.logs
node website-searcher.js --url https://site.com --search 'console.log' --output debug.csv

# Find TODO comments
node website-searcher.js --url https://site.com --search 'TODO' --case-insensitive --output todos.csv

# Find alert() calls
node website-searcher.js --url https://site.com --search 'alert(' --output alerts.csv
```

### Tracking & Analytics
```bash
# Google Analytics
node website-searcher.js --url https://site.com --search 'gtag\|google-analytics' --regex --output ga.csv

# Facebook Pixel
node website-searcher.js --url https://site.com --search 'facebook.com/tr' --output fb.csv

# All tracking
node website-searcher.js --url https://site.com --search 'pixel\|gtag\|analytics' --regex --output tracking.csv
```

### Migration & Cleanup
```bash
# Find old domain
node website-searcher.js --url https://site.com --search 'old-domain.com' --output old.csv

# Find deprecated endpoints
node website-searcher.js --url https://site.com --search '/api/v1' --output deprecated-api.csv

# Find hard-coded IPs
node website-searcher.js --url https://site.com --search '\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}' --regex --output ips.csv
```

---

## 💡 Pro Tips

### Tip 1: Test Before Running Large Crawl
```bash
# Run with --max-pages 10 first
node website-searcher.js --url https://site.com --search "pattern" --max-pages 10

# Once confirmed, run full crawl
node website-searcher.js --url https://site.com --search "pattern" --max-pages 500
```

### Tip 2: Use Regex Carefully
Test your regex at https://regex101.com before using in CLI:
1. Paste sample HTML
2. Test your pattern
3. Copy exact pattern to CLI

### Tip 3: Combine with grep (CLI)
```bash
# Save results and filter
node website-searcher.js --url https://site.com --search "pattern" --output results.csv

# Find specific results
grep "keyword" results.csv
```

### Tip 4: Schedule Searches
```bash
# Create a bash script for repeated searches
#!/bin/bash
DATE=$(date +%Y-%m-%d)
node website-searcher.js --url https://site.com --search "pattern" --output "results-$DATE.csv"
```

### Tip 5: Compare Results Over Time
```bash
# Run same search weekly, compare changes
node website-searcher.js --url https://site.com --search "pattern" --output "results-week1.csv"
# ... week 2 ...
node website-searcher.js --url https://site.com --search "pattern" --output "results-week2.csv"

# Compare with: diff results-week1.csv results-week2.csv
```

---

## 🐛 Quick Fixes

| Issue | Fix |
|-------|-----|
| Pattern matches too much | Use more specific text or regex |
| Pattern matches nothing | Check case sensitivity, test at regex101.com |
| Search is slow | Use `--max-pages 50` to test first |
| CSV file empty | Verify search pattern exists on site |
| Too many pages timing out | Reduce `--max-pages` value |
| CORS errors in web app | Use CLI tool instead |

---

## 📋 CSV Output Format

When exporting (with `--output results.csv`):

```
Page URL,Match Count,Matched Text,Sample Preview
"https://site.com/page1","3","href=/about","...this is a link href=/about to our..."
"https://site.com/page2","1","href=/about","...click href=/about for info..."
```

Open with:
- ✅ Excel
- ✅ Google Sheets
- ✅ Apple Numbers
- ✅ LibreOffice
- ✅ Any text editor

---

## 🎓 Learning Resources

- **Regex tutorials:** https://regex101.com (interactive)
- **Node.js docs:** https://nodejs.org/docs/
- **Web scraping tips:** https://developer.mozilla.org/

---

## 📊 Expected Performance

| Site Size | Web App | CLI Tool |
|-----------|---------|----------|
| Small (50 pages) | 30-60 sec | 10-20 sec |
| Medium (500 pages) | 5-10 min | 1-3 min |
| Large (5000+ pages) | ❌ Not recommended | 10-30 min |

Times vary based on:
- Website speed
- Network connection
- Pattern complexity
- Server response time

---

## 🆘 Need Help?

1. **Web App Issues:**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Try simpler search pattern

2. **CLI Issues:**
   - Add `--verbose` flag
   - Check Node.js: `node --version`
   - Test connection: `curl https://yoursite.com`

3. **Pattern Issues:**
   - Test at https://regex101.com
   - Start simple, build up
   - Try plain text first, then regex

---

**Last updated: May 2026**
**Version: 1.0**

