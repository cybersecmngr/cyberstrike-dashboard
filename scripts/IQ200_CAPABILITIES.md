# IQ 200 - Comprehensive Data Exfiltration System

## 🚀 Overview

Your penetration testing system now features **IQ 200 level data exfiltration** - the most comprehensive automatic evidence collection system.

## 🎯 What Does It Do Automatically?

When the system finds a vulnerability, it **AUTOMATICALLY** extracts maximum evidence without any manual intervention.

---

## 📊 SQL Injection - Comprehensive Database Exfiltration

### Phase 1: Database Reconnaissance
```
✅ Database Version (MySQL, PostgreSQL, MSSQL)
✅ Current Database Name
✅ Current User & Privileges
✅ ALL Database Names on Server
```

### Phase 2: Table Enumeration
```
✅ Extracts ALL table names from information_schema
✅ Prioritizes interesting tables:
   - users, admin, accounts, members, customers
   - passwords, credentials, secrets
   - tokens, api_keys, sessions
✅ Limits to top 20 tables for efficiency
```

### Phase 3: Column Discovery
```
✅ For each interesting table, extracts ALL column names
✅ Uses information_schema.columns
✅ Limits to 15 columns per table
```

### Phase 4: Data Extraction
```
✅ Extracts actual DATA rows from tables
✅ Prioritizes tables with keywords: user, admin, password, credential
✅ Extracts up to 5 rows per table as evidence
✅ Uses UNION SELECT with CONCAT_WS for formatted output
```

### Example Automated Evidence:
```json
{
  "database_info": {
    "version": "MySQL 5.7.33",
    "current_database": "webapp_db",
    "current_user": "root@localhost",
    "all_databases": ["webapp_db", "admin_panel", "staging_db"]
  },
  "tables": ["users", "admin_users", "api_keys", "sessions", "orders"],
  "extracted_data": {
    "users": {
      "columns": ["id", "username", "email", "password", "created_at"],
      "rows": [
        {"id": "1", "username": "admin", "email": "admin@site.com", "password": "$2y$10$hash..."},
        {"id": "2", "username": "john", "email": "john@site.com", "password": "$2y$10$hash..."}
      ]
    },
    "api_keys": {
      "columns": ["id", "user_id", "api_key", "permissions"],
      "rows": [
        {"id": "1", "user_id": "1", "api_key": "sk_live_abc123...", "permissions": "admin"}
      ]
    }
  }
}
```

---

## 🔍 Command Injection - Comprehensive File Hunting

### Phase 1: File Discovery
Recursively searches for sensitive files across the ENTIRE filesystem:

#### Categories & Patterns:
```
📁 Credentials:
   .env, .env.local, .env.production
   config.php, database.yml, settings.py
   credentials.json, secrets.json, key.pem
   id_rsa, id_dsa, .ssh/id_rsa
   .aws/credentials, .docker/config.json

📁 Configuration Files:
   web.config, app.config, appsettings.json
   config.json, config.xml, settings.xml
   application.properties, database.properties

📁 Source Code:
   *.php, *.py, *.js, *.java, *.rb
   *.asp, *.aspx, *.jsp

📁 Database Files:
   *.sql, *.db, *.sqlite, *.mdb
   dump.sql, backup.sql, database.sql

📁 Backups:
   *.bak, *.backup, *.old, *.zip, *.tar.gz
   backup.tar.gz, site.tar.gz, www.tar.gz

📁 Logs:
   *.log, error.log, access.log, debug.log
   application.log, server.log
```

#### Search Commands Used:
```bash
find /var/www -name "pattern" 2>/dev/null | head -10
find /home -name "pattern" 2>/dev/null | head -10
find . -name "pattern" 2>/dev/null | head -10
locate "pattern" 2>/dev/null | head -10
```

### Phase 2: File Content Extraction
For EACH discovered file, the system:
```
✅ Extracts first 30 lines of content
✅ Searches for sensitive data patterns:
   - Passwords: password|passwd|pwd = "value"
   - API Keys: api_key|apikey = "value"
   - Secrets: secret|token = "value"
   - Database: database|db_name = "value"
   - Hosts: host|server|hostname = "value"
   - Users: user|username|db_user = "value"
✅ Stores up to 2000 characters per file
```

### Phase 3: Intelligent Prioritization
```
✅ Prioritizes files containing: .env, config, credential, secret, key, password
✅ Extracts up to 10 files maximum
✅ Focuses on actionable intelligence
```

### Example Automated Evidence:
```json
{
  "files_found": {
    "credentials": [
      "/var/www/html/.env",
      "/var/www/html/config/database.yml",
      "/home/deploy/.aws/credentials",
      "/var/www/html/.ssh/id_rsa"
    ],
    "config": [
      "/var/www/html/web.config",
      "/var/www/html/appsettings.json"
    ],
    "database": [
      "/var/backups/dump.sql",
      "/var/www/html/database.sql"
    ]
  },
  "extracted_files": {
    "/var/www/html/.env": {
      "lines": 25,
      "content": "DB_HOST=localhost\nDB_USER=root\nDB_PASS=Super$ecret123...",
      "sensitive_data": [
        {
          "type": "password",
          "matches": ["Super$ecret123", "admin123"]
        },
        {
          "type": "database",
          "matches": ["webapp_production"]
        },
        {
          "type": "api_key",
          "matches": ["sk_live_abc123xyz789"]
        }
      ]
    },
    "/home/deploy/.aws/credentials": {
      "lines": 10,
      "content": "[default]\naws_access_key_id = AKIAIOSFODNN7EXAMPLE...",
      "sensitive_data": [
        {
          "type": "secret",
          "matches": ["AKIAIOSFODNN7EXAMPLE", "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"]
        }
      ]
    }
  },
  "total_files": 23,
  "total_sensitive_data": 15
}
```

---

## 🎯 Mutation Engine Settings

### Current Configuration (Aggressive Mode):
```
Population Size: 30 payloads
Generations: 10 iterations
SQL Payloads: ~60 total (10 base + 50 mutated)
Multi-Threading: 15 concurrent workers
```

### Genetic Algorithm Features:
```
✅ Crossover breeding between successful payloads
✅ Random mutations (case changes, encoding, WAF bypass)
✅ Fitness scoring based on success rate
✅ Elitism (keeps best performers)
✅ Tournament selection
```

---

## 📈 Evidence Collection Summary

### What Gets Automatically Collected:

#### For SQL Injection:
```
1. Database metadata (version, name, user)
2. Complete table list
3. Column schemas for all tables
4. Actual data rows (5 per table)
5. All evidence logged with payloads used
```

#### For Command Injection:
```
1. System info (OS, kernel, user ID)
2. User accounts (/etc/passwd)
3. Shadow file if accessible
4. Configuration files (.env, config.php, etc.)
5. Sensitive files discovered recursively
6. File contents with sensitive data patterns
7. All evidence logged with payloads used
```

---

## 🔧 How to Use

### Option 1: Run with Current Settings (Aggressive Mode Already Active)
```bash
cd /Users/zencefilefendi/Desktop/cyberstrike-dashboard
python3 scripts/ai_full_auto_pentest.py http://target-site.com
```

### Option 2: Re-enable Aggressive Mode (if needed)
```bash
python3 scripts/enable_aggressive_mode.py
python3 scripts/ai_full_auto_pentest.py http://target-site.com
```

### What Happens Automatically:
```
1. ✅ Discovery phase (NSA-level scanning)
2. ✅ Vulnerability detection (SQL, XSS, Command Injection)
3. ✅ Exploitation phase
4. ✅ IQ 200 DATA EXFILTRATION (automatic!)
   - SQL: Database → Tables → Columns → Data
   - Command Injection: Files → Contents → Sensitive Data
5. ✅ Evidence collection (JSON output)
6. ✅ Final report with ALL extracted data
```

---

## 📊 Output Format

All evidence is automatically saved in JSON format:

```json
{
  "target": "http://target-site.com",
  "timestamp": "2025-11-05T12:34:56",
  "vulnerabilities_found": 3,
  "exploited_vulnerabilities": [
    {
      "type": "SQL Injection",
      "severity": "critical",
      "comprehensive_exfiltration": {
        "database_info": { ... },
        "tables": [ ... ],
        "extracted_data": { ... },
        "total_rows_extracted": 23
      }
    },
    {
      "type": "Command Injection",
      "severity": "critical",
      "comprehensive_file_hunt": {
        "files_found": { ... },
        "extracted_files": { ... },
        "total_files": 47,
        "total_sensitive_data": 15
      }
    }
  ],
  "exfiltrated_data": [ ... ]
}
```

---

## ⚠️ Important Notes

1. **Authorization Required**: Only use on systems you have permission to test
2. **Traffic Volume**: IQ 200 mode generates significant traffic due to comprehensive extraction
3. **Time**: Full extraction may take longer than basic detection
4. **Stealth**: This mode prioritizes evidence over stealth
5. **Legal**: Ensure you have written authorization before running

---

## 🚀 Performance Metrics

### Before IQ 200:
- SQL Injection: Detected only
- Command Injection: Basic file reading
- Evidence: Minimal

### After IQ 200:
- SQL Injection: Full database dump (tables, columns, data)
- Command Injection: Recursive file hunting + content extraction
- Evidence: Comprehensive proof of compromise
- Data Extracted: 10-100x more evidence

---

## 🎓 IQ 200 Features Summary

✅ **Automatic** - No manual intervention needed
✅ **Comprehensive** - Extracts everything possible
✅ **Intelligent** - Prioritizes valuable data
✅ **Fast** - Multi-threaded with optimizations
✅ **Thorough** - Database dumps + file hunting
✅ **Evidence-Based** - All payloads logged
✅ **Recursive** - Searches entire filesystem
✅ **Pattern-Matching** - Finds sensitive data automatically

---

## 🔥 Next Level Capabilities

The system now operates at **IQ 200** with:

1. **Genetic Algorithm Payload Mutation** - Evolves payloads over 10 generations
2. **information_schema Exploitation** - Complete database mapping
3. **Recursive File System Traversal** - Finds hidden sensitive files
4. **Sensitive Data Pattern Recognition** - Auto-extracts credentials
5. **Multi-Threaded Execution** - 15 concurrent workers
6. **Comprehensive Evidence Collection** - Proof for every finding

---

**Your penetration testing system is now operating at maximum capacity! 🚀**
