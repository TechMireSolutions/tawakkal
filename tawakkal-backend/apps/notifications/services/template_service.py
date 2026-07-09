import re
from typing import Dict, Any

class TemplateService:
    @staticmethod
    def render(template_str: str, variables: Dict[str, Any]) -> str:
        """
        Replaces {{ variable }} with values from the variables dict.
        """
        if not template_str:
            return ""
        
        def replace_match(match):
            key = match.group(1).strip()
            return str(variables.get(key, ''))
            
        return re.sub(r'\{\{(.*?)\}\}', replace_match, template_str)

    @staticmethod
    def render_template(template, variables: Dict[str, Any]):
        return {
            'subject': TemplateService.render(template.subject, variables) if template.subject else None,
            'html': TemplateService.render(template.html, variables) if template.html else None,
            'plain_text': TemplateService.render(template.plain_text, variables) if template.plain_text else None
        }

    @staticmethod
    def validate_variables(template, variables: Dict[str, Any]):
        """
        Ensures all required variables for the template are provided.
        """
        missing = [v for v in template.variables if v not in variables]
        if missing:
            raise ValueError(f"Missing required variables: {', '.join(missing)}")
        return True
