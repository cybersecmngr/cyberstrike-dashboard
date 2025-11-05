#!/usr/bin/env python3
"""
AI-Powered Social Engineering Framework
Advanced AI-driven social engineering attack generation
Phishing email generation, pretexting, and psychological manipulation
"""

import sys
import json
import random
import re
from typing import Dict, List, Optional
from datetime import datetime

class AISocialEngineeringFramework:
    """AI-powered social engineering framework"""
    
    # Phishing email templates
    PHISHING_TEMPLATES = {
        'password_reset': {
            'subject': 'Urgent: Password Reset Required',
            'urgency': 'high',
            'psychological_trigger': 'fear',
            'success_rate': 0.35
        },
        'security_alert': {
            'subject': 'Security Alert: Suspicious Activity Detected',
            'urgency': 'very_high',
            'psychological_trigger': 'fear',
            'success_rate': 0.45
        },
        'account_verification': {
            'subject': 'Verify Your Account - Action Required',
            'urgency': 'medium',
            'psychological_trigger': 'authority',
            'success_rate': 0.30
        },
        'prize_winner': {
            'subject': 'Congratulations! You Won a Prize',
            'urgency': 'medium',
            'psychological_trigger': 'greed',
            'success_rate': 0.25
        },
        'invoice_payment': {
            'subject': 'Invoice Payment Required - Due Soon',
            'urgency': 'high',
            'psychological_trigger': 'fear',
            'success_rate': 0.40
        },
        'ceo_impersonation': {
            'subject': 'Urgent Request - CEO',
            'urgency': 'very_high',
            'psychological_trigger': 'authority',
            'success_rate': 0.50
        }
    }
    
    # Psychological manipulation techniques
    PSYCHOLOGICAL_TECHNIQUES = {
        'urgency': {
            'description': 'Create sense of urgency',
            'examples': [
                'Your account will be closed in 24 hours',
                'Immediate action required',
                'Limited time offer',
                'Act now or lose access'
            ]
        },
        'authority': {
            'description': 'Authority figure impersonation',
            'examples': [
                'IT Department',
                'Security Team',
                'CEO',
                'Bank Official',
                'Government Agency'
            ]
        },
        'fear': {
            'description': 'Fear-based manipulation',
            'examples': [
                'Your account has been compromised',
                'Unauthorized access detected',
                'Security breach',
                'Legal action required'
            ]
        },
        'greed': {
            'description': 'Greed-based manipulation',
            'examples': [
                'You won a prize',
                'Free money',
                'Exclusive offer',
                'Limited time discount'
            ]
        },
        'curiosity': {
            'description': 'Curiosity-based manipulation',
            'examples': [
                'See what people are saying about you',
                'Someone viewed your profile',
                'You have a new message',
                'Check this out'
            ]
        },
        'social_proof': {
            'description': 'Social proof manipulation',
            'examples': [
                'Thousands of users have already claimed',
                'Join millions of satisfied customers',
                'Most trusted by users',
                'Recommended by experts'
            ]
        }
    }
    
    @staticmethod
    def generate_phishing_email(template_type: str, target_name: str = 'User', target_email: str = 'user@example.com') -> Dict:
        """Generate AI-powered phishing email"""
        template = AISocialEngineeringFramework.PHISHING_TEMPLATES.get(
            template_type,
            AISocialEngineeringFramework.PHISHING_TEMPLATES['password_reset']
        )
        
        # Generate email content
        if template_type == 'password_reset':
            email_body = f"""
Dear {target_name},

We detected unusual activity on your account. For your security, we have temporarily locked your account.

To restore access, please verify your identity by clicking the link below:

[VERIFICATION_LINK]

This link will expire in 24 hours. If you did not request this, please contact our support team immediately.

Best regards,
Security Team
"""
        elif template_type == 'security_alert':
            email_body = f"""
Dear {target_name},

SECURITY ALERT: We detected multiple failed login attempts to your account from an unrecognized location.

If this was not you, please secure your account immediately:

[SECURE_ACCOUNT_LINK]

If you recognize this activity, you can safely ignore this email.

Security Team
"""
        elif template_type == 'ceo_impersonation':
            email_body = f"""
Hi {target_name},

I need your immediate assistance with a confidential matter. Please process the payment request below:

[PAYMENT_LINK]

This is urgent and requires your immediate attention. Please respond as soon as possible.

Thank you,
[CEO_NAME]
"""
        else:
            email_body = f"Dear {target_name},\n\n[EMAIL_CONTENT]\n\nBest regards"
        
        return {
            'template_type': template_type,
            'subject': template['subject'],
            'from': 'noreply@legitimatedomain.com',
            'to': target_email,
            'body': email_body.strip(),
            'urgency': template['urgency'],
            'psychological_trigger': template['psychological_trigger'],
            'estimated_success_rate': template['success_rate'],
            'phishing_indicators': [
                'Urgent language',
                'Request for credentials',
                'Suspicious link',
                'Grammar errors',
                'Generic greeting'
            ]
        }
    
    @staticmethod
    def generate_pretexting_scenario(scenario_type: str) -> Dict:
        """Generate pretexting scenario"""
        scenarios = {
            'tech_support': {
                'role': 'IT Support Technician',
                'company': 'Microsoft / Apple / Google',
                'objective': 'Gain remote access',
                'script': 'Hi, I\'m calling from [COMPANY] technical support. We detected an issue with your computer and need to fix it remotely. Can you please download and run this software?'
            },
            'bank_official': {
                'role': 'Bank Security Officer',
                'company': 'Your Bank',
                'objective': 'Verify account information',
                'script': 'Hello, this is [NAME] from [BANK] security department. We need to verify some account information due to suspicious activity. Can you please confirm your account number and password?'
            },
            'survey_researcher': {
                'role': 'Market Researcher',
                'company': 'Research Company',
                'objective': 'Collect personal information',
                'script': 'Hi, I\'m conducting a survey for [COMPANY]. Could you answer a few questions? We\'re offering a $50 gift card for participation.'
            },
            'government_agent': {
                'role': 'Government Agent',
                'company': 'IRS / FBI / Police',
                'objective': 'Intimidate and extract information',
                'script': 'This is [AGENT_NAME] from [AGENCY]. We need to verify your identity for an ongoing investigation. Please provide your Social Security Number and date of birth.'
            }
        }
        
        selected = scenarios.get(scenario_type, scenarios['tech_support'])
        
        return {
            'scenario_type': scenario_type,
            'role': selected['role'],
            'company': selected['company'],
            'objective': selected['objective'],
            'script': selected['script'],
            'psychological_techniques': [
                'Authority',
                'Urgency',
                'Fear',
                'Social proof'
            ],
            'estimated_success_rate': 0.30
        }
    
    @staticmethod
    def analyze_target_profile(target_info: Dict) -> Dict:
        """Analyze target for social engineering"""
        analysis = {
            'target_name': target_info.get('name', 'Unknown'),
            'target_email': target_info.get('email', 'unknown@example.com'),
            'vulnerability_assessment': {},
            'recommended_attacks': [],
            'psychological_profile': {}
        }
        
        # Analyze email domain
        email_domain = target_info.get('email', '').split('@')[1] if '@' in target_info.get('email', '') else ''
        corporate_domains = ['company.com', 'corp.com', 'enterprise.com']
        is_corporate = any(domain in email_domain for domain in corporate_domains)
        
        # Vulnerability assessment
        analysis['vulnerability_assessment'] = {
            'target_type': 'corporate' if is_corporate else 'individual',
            'risk_level': 'high' if is_corporate else 'medium',
            'likely_vectors': [
                'Phishing email',
                'Phone call',
                'Social media',
                'Physical access'
            ]
        }
        
        # Recommended attacks
        if is_corporate:
            analysis['recommended_attacks'] = [
                'CEO impersonation',
                'IT support call',
                'Security alert email',
                'Invoice payment request'
            ]
        else:
            analysis['recommended_attacks'] = [
                'Password reset email',
                'Prize winner notification',
                'Account verification',
                'Social media phishing'
            ]
        
        # Psychological profile
        analysis['psychological_profile'] = {
            'likely_triggers': ['urgency', 'fear', 'authority'],
            'susceptibility': 'medium',
            'recommended_approach': 'Multi-vector attack'
        }
        
        return analysis
    
    @staticmethod
    def generate_credential_harvesting_page(service: str = 'Microsoft') -> Dict:
        """Generate credential harvesting page"""
        page_templates = {
            'microsoft': {
                'title': 'Microsoft Account Sign In',
                'logo_url': 'https://www.microsoft.com/favicon.ico',
                'form_fields': ['email', 'password'],
                'branding': 'Microsoft'
            },
            'google': {
                'title': 'Google Account',
                'logo_url': 'https://www.google.com/favicon.ico',
                'form_fields': ['email', 'password'],
                'branding': 'Google'
            },
            'bank': {
                'title': 'Bank Login',
                'logo_url': 'https://bank.com/logo.png',
                'form_fields': ['username', 'password', 'account_number'],
                'branding': 'Bank'
            }
        }
        
        template = page_templates.get(service.lower(), page_templates['microsoft'])
        
        html_template = f"""
<!DOCTYPE html>
<html>
<head>
    <title>{template['title']}</title>
    <style>
        body {{ font-family: Arial, sans-serif; }}
        .login-form {{ max-width: 400px; margin: 100px auto; }}
        .logo {{ text-align: center; }}
        input {{ width: 100%; padding: 10px; margin: 10px 0; }}
        button {{ width: 100%; padding: 10px; background: #0078d4; color: white; border: none; }}
    </style>
</head>
<body>
    <div class="login-form">
        <div class="logo">
            <img src="{template['logo_url']}" alt="{template['branding']}">
            <h1>{template['title']}</h1>
        </div>
        <form action="/harvest" method="POST">
            <input type="email" name="email" placeholder="Email" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Sign In</button>
        </form>
    </div>
</body>
</html>
"""
        
        return {
            'service': service,
            'page_html': html_template,
            'harvesting_endpoint': '/harvest',
            'form_fields': template['form_fields'],
            'branding': template['branding'],
            'phishing_indicators': [
                'Fake domain',
                'HTTP instead of HTTPS',
                'Suspicious form action',
                'No SSL certificate',
                'Generic branding'
            ]
        }
    
    @staticmethod
    def comprehensive_social_engineering_framework(target: str, attack_type: str = 'phishing') -> Dict:
        """Comprehensive AI-powered social engineering framework"""
        result = {
            'success': True,
            'target': target,
            'attack_type': attack_type,
            'phishing_email': {},
            'pretexting_scenario': {},
            'credential_harvesting': {},
            'target_analysis': {},
            'summary': {
                'attack_vectors': 0,
                'estimated_success_rate': 0.0,
                'recommendations': []
            }
        }
        
        try:
            # Target analysis
            target_info = {'email': target, 'name': 'Target User'}
            target_analysis = AISocialEngineeringFramework.analyze_target_profile(target_info)
            result['target_analysis'] = target_analysis
            
            # Generate phishing email
            if attack_type == 'phishing':
                phishing_email = AISocialEngineeringFramework.generate_phishing_email(
                    'password_reset', target_analysis['target_name'], target
                )
                result['phishing_email'] = phishing_email
            
            # Generate pretexting scenario
            pretexting = AISocialEngineeringFramework.generate_pretexting_scenario('tech_support')
            result['pretexting_scenario'] = pretexting
            
            # Generate credential harvesting page
            harvesting = AISocialEngineeringFramework.generate_credential_harvesting_page('microsoft')
            result['credential_harvesting'] = harvesting
            
            # Summary
            result['summary']['attack_vectors'] = len(AISocialEngineeringFramework.PHISHING_TEMPLATES)
            result['summary']['estimated_success_rate'] = phishing_email.get('estimated_success_rate', 0.35) * 100
            
            result['summary']['recommendations'] = [
                'Use multiple attack vectors',
                'Customize emails for target',
                'Use legitimate-looking domains',
                'Implement urgency and authority',
                'Test email delivery rates',
                'Monitor click rates',
                'Use psychological manipulation techniques',
                'Rotate attack methods'
            ]
            
            result['message'] = f'Social engineering framework configured. Estimated success rate: {result["summary"]["estimated_success_rate"]:.1f}%'
            
        except Exception as e:
            result['success'] = False
            result['error'] = str(e)
        
        return result

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Target email required'}))
        sys.exit(1)
    
    target = sys.argv[1]
    attack_type = sys.argv[2] if len(sys.argv) > 2 else 'phishing'
    
    result = AISocialEngineeringFramework.comprehensive_social_engineering_framework(target, attack_type)
    print(json.dumps({'success': True, 'result': result}))

