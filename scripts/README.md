# CyberStrike Dashboard Python Scripts

Bu klasörde dashboard'un backend API'lerini destekleyen Python script'leri bulunur.

## Kurulum

```bash
# Python bağımlılıklarını yükle
pip3 install -r ../requirements.txt
```

## Script'ler

### 1. `ssl_analyzer.py`
SSL/TLS sertifika analizi yapar.

**Kullanım:**
```bash
python3 ssl_analyzer.py example.com 443
```

**Bağımlılıklar:**
- `python-dateutil` (opsiyonel, tarih parsing için)

### 2. `subdomain_enum.py`
Subdomain keşfi yapar.

**Kullanım:**
```bash
python3 subdomain_enum.py example.com
```

**Bağımlılıklar:**
- `sublist3r` veya `amass` (opsiyonel, daha iyi sonuçlar için)

### 3. `dns_enum.py`
DNS kayıtlarını sorgular.

**Kullanım:**
```bash
python3 dns_enum.py example.com A
python3 dns_enum.py example.com MX
```

**Bağımlılıklar:**
- `dnspython` (zorunlu)

### 4. `vuln_scanner.py`
Zafiyet taraması yapar.

**Kullanım:**
```bash
python3 vuln_scanner.py 192.168.1.1 quick
python3 vuln_scanner.py example.com full
```

**Bağımlılıklar:**
- `nmap` (opsiyonel, daha iyi sonuçlar için)
- `nikto` (opsiyonel, web zafiyetleri için)

## Notlar

- Script'ler JSON formatında çıktı verir
- Tüm script'ler hata durumunda mock data döndürür
- Script'ler executable olarak ayarlanmıştır (`chmod +x`)

