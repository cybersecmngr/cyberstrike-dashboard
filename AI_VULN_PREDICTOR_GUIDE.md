# AI Vulnerability Predictor - Kullanım Kılavuzu

## 🧠 AI Vuln Predictor Nedir?

AI Vulnerability Predictor, **Machine Learning (ML) tabanlı pattern recognition** kullanarak web uygulamalarındaki potansiyel güvenlik açıklarını **tahmin eden** gelişmiş bir analiz aracıdır.

### Özellikler:
- ✅ **URL Analizi**: URL parametrelerinden vulnerability pattern'leri tespit eder
- ✅ **Code Analizi**: Kaynak kodundaki güvenlik açıklarını tahmin eder
- ✅ **Pattern Recognition**: ML-inspired pattern matching algoritması
- ✅ **Confidence Scoring**: Her tahmin için güven skoru (0-100%)
- ✅ **Risk Assessment**: Overall risk seviyesi (low/medium/high/critical)

---

## 📋 Nasıl Kullanılır?

### 1. Dashboard'dan Kullanım

1. **Z.D.E** tab'ına gidin
2. **AI Vuln Predictor** widget'ını bulun
3. **Target URL or Code** alanına analiz edilecek URL veya kod yapıştırın
4. **Analysis Type** seçin:
   - `URL Analysis`: URL analizi için
   - `Code Analysis`: Kaynak kod analizi için
5. **"Predict Vulnerabilities"** butonuna tıklayın

### 2. Örnek Kullanımlar

#### URL Analizi Örnekleri:

```
✅ İyi Örnekler:
https://example.com?id=1
https://example.com?user=admin&page=1
https://example.com?search=test&sort=name
https://example.com?file=test.txt&download=true

❌ Riskli Örnekler (AI bunları tespit eder):
https://example.com?id=1' OR '1'='1
https://example.com?search=<script>alert('XSS')</script>
https://example.com?cmd=id&exec=ls
https://example.com?file=../../../etc/passwd
```

#### Code Analizi Örnekleri:

```php
// Riskli kod örneği (AI tespit eder):
<?php
$user = $_GET['user'];
$query = "SELECT * FROM users WHERE id = '$user'";
$result = mysql_query($query);
?>

// Güvenli kod örneği:
<?php
$user = $_GET['user'];
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$user]);
?>
```

---

## 🔍 Nasıl Çalışır?

### Pattern Recognition Algoritması

AI Vuln Predictor, şu vulnerability pattern'lerini tespit eder:

#### 1. SQL Injection Patterns
```python
Patterns:
- 'select.*from'
- 'union select'
- 'where.*='
- 'order by'
- 'group by'
- 'insert into'
- 'update.*set'
- 'delete from'

Weight: 0.9 (Yüksek risk)
```

#### 2. XSS (Cross-Site Scripting) Patterns
```python
Patterns:
- '<script'
- 'javascript:'
- 'onerror='
- 'onload='
- 'eval('
- 'document.'
- 'innerHTML'
- 'outerHTML'

Weight: 0.85 (Yüksek risk)
```

#### 3. RCE (Remote Code Execution) Patterns
```python
Patterns:
- 'system('
- 'exec('
- 'eval('
- 'shell_exec'
- 'passthru'
- 'popen'
- 'proc_open'

Weight: 0.95 (Çok yüksek risk)
```

#### 4. Path Traversal Patterns
```python
Patterns:
- '../'
- '..\\'
- '%2e%2e%2f'
- '%2e%2e%5c'

Weight: 0.75 (Orta-yüksek risk)
```

#### 5. Command Injection Patterns
```python
Patterns:
- ';.*'
- '|.*'
- '&&.*'
- '||.*'
- '`.*`'
- '$(.*)'

Weight: 0.9 (Yüksek risk)
```

---

## 📊 Sonuç Analizi

### 1. Overall Risk Level

AI Predictor şu risk seviyelerini döndürür:

- **CRITICAL** (Kırmızı): Risk skoru ≥ 0.8
- **HIGH** (Turuncu): Risk skoru ≥ 0.6
- **MEDIUM** (Sarı): Risk skoru ≥ 0.4
- **LOW** (Yeşil): Risk skoru < 0.4

### 2. Confidence Score

Her tahmin için **güven skoru** (0-100%) verilir:
- **%80-100**: Çok yüksek güven
- **%60-79**: Yüksek güven
- **%40-59**: Orta güven
- **%0-39**: Düşük güven

### 3. Predictions (Tahminler)

Her vulnerability için:
- **Type**: Vulnerability tipi (sql_injection, xss, rce, vb.)
- **Parameter**: Riskli parametre adı
- **Confidence**: Güven skoru
- **Reason**: Tespit nedeni

---

## 🎯 Pratik Örnekler

### Örnek 1: SQL Injection Tespiti

**Input:**
```
https://example.com?id=1&user=admin
```

**Output:**
```json
{
  "overall_risk": "medium",
  "confidence": 0.60,
  "predictions": [
    {
      "type": "sql_injection",
      "parameter": "id",
      "confidence": 0.6,
      "reason": "URL contains suspicious parameter: id="
    },
    {
      "type": "sql_injection",
      "parameter": "user",
      "confidence": 0.6,
      "reason": "URL contains suspicious parameter: user="
    }
  ]
}
```

### Örnek 2: XSS Tespiti

**Input:**
```
https://example.com?search=test&q=<script>alert('XSS')</script>
```

**Output:**
```json
{
  "overall_risk": "high",
  "confidence": 0.85,
  "predictions": [
    {
      "type": "xss",
      "parameter": "q",
      "confidence": 0.85,
      "reason": "Parameter q contains XSS-like patterns"
    }
  ]
}
```

### Örnek 3: Path Traversal Tespiti

**Input:**
```
https://example.com?file=../../../etc/passwd
```

**Output:**
```json
{
  "overall_risk": "high",
  "confidence": 0.90,
  "predictions": [
    {
      "type": "path_traversal",
      "parameter": "file",
      "confidence": 0.9,
      "reason": "Parameter file contains path traversal patterns"
    }
  ]
}
```

---

## 🔧 Terminal'den Kullanım

### Python Script ile:

```bash
# URL analizi
python3 scripts/ai_vuln_predictor.py "https://example.com?id=1&search=test" "url"

# Code analizi
python3 scripts/ai_vuln_predictor.py "<?php system(\$_GET['cmd']); ?>" "code"
```

### Output Örneği:

```json
{
  "success": true,
  "result": {
    "success": true,
    "target": "https://example.com?id=1&search=test",
    "analysis_type": "url",
    "predictions": [
      {
        "type": "sql_injection",
        "parameter": "id",
        "confidence": 0.6,
        "reason": "URL contains suspicious parameter: id="
      },
      {
        "type": "xss",
        "parameter": "search",
        "confidence": 0.6,
        "reason": "URL contains suspicious parameter: search="
      }
    ],
    "overall_risk": "medium",
    "confidence": 0.405,
    "recommendations": [
      "Regular security monitoring",
      "Keep software updated",
      "Follow secure coding practices"
    ]
  }
}
```

---

## 📈 Scoring Algoritması

### Risk Score Hesaplama:

1. **Pattern Matching**: Her vulnerability pattern'i için match sayısı bulunur
2. **Weight Multiplication**: Match sayısı × Pattern weight
3. **Score Accumulation**: Tüm pattern'lerin score'ları toplanır
4. **Normalization**: Score 0-1 aralığına normalize edilir
5. **Risk Level**: Score'a göre risk seviyesi belirlenir

### Örnek Hesaplama:

```
URL: https://example.com?id=1&search=<script>

SQL Injection:
- id=1 → Match: 1 → Score: 1 × 0.9 = 0.9
- Risk Score: 0.9

XSS:
- search=<script> → Match: 1 → Score: 1 × 0.85 = 0.85
- Risk Score: 0.85

Total Risk Score: (0.9 + 0.85) / 2 = 0.875
Risk Level: CRITICAL (≥ 0.8)
```

---

## 🛡️ Güvenlik Önerileri

### AI Predictor Sonuçlarına Göre:

#### Risk: CRITICAL
- ✅ Hemen güvenlik incelemesi yapın
- ✅ Input validation ekleyin
- ✅ WAF kurun
- ✅ Güvenlik testleri yapın

#### Risk: HIGH
- ✅ Kodları gözden geçirin
- ✅ Parameter sanitization uygulayın
- ✅ Security headers ekleyin
- ✅ Düzenli güvenlik taraması yapın

#### Risk: MEDIUM
- ✅ Güvenlik izleme yapın
- ✅ Yazılımları güncel tutun
- ✅ Best practices uygulayın

#### Risk: LOW
- ✅ Düzenli monitoring
- ✅ Güvenlik güncellemelerini takip edin

---

## 💡 İpuçları

1. **URL Analizi** için tam URL'yi girin (query parametreleri dahil)
2. **Code Analizi** için tam kod snippet'ini yapıştırın
3. **Confidence Score** düşükse, sonuçları manuel kontrol edin
4. **Multiple Predictions** varsa, her birini ayrı ayrı inceleyin
5. **Risk Level** yüksekse, acil önlem alın

---

## ⚠️ Önemli Notlar

- AI Predictor **tahmin** yapar, kesin sonuç vermez
- **False Positive** olabilir, manuel doğrulama yapın
- **False Negative** olabilir, tüm güvenlik açıklarını bulamayabilir
- Gerçek güvenlik testleri için **penetration testing** yapın
- Sadece **kendi sistemlerinizi** test edin

---

## 🎓 Kullanım Senaryoları

### Senaryo 1: Web Uygulaması Güvenlik Kontrolü

```
1. Tüm URL endpoint'lerini AI Predictor ile test edin
2. Risk seviyesi yüksek olanları işaretleyin
3. Manuel penetration testing yapın
4. Güvenlik açıklarını düzeltin
```

### Senaryo 2: Code Review

```
1. Şüpheli kod parçalarını AI Predictor ile analiz edin
2. Pattern match'leri kontrol edin
3. Güvenli alternatifler uygulayın
4. Tekrar test edin
```

### Senaryo 3: Bug Bounty

```
1. Hedef URL'leri AI Predictor ile tarayın
2. Yüksek risk skorlu endpoint'leri önceliklendirin
3. Manuel test yapın
4. Exploit geliştirin
```

---

**AI Vuln Predictor, güvenlik açıklarını tespit etmek için ML tabanlı bir yardımcı araçtır. Gerçek güvenlik testleri için profesyonel penetration testing araçları kullanın!**

