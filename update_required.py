import re

def process_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # We need to remove: <span class="text-red-500">*</span>
    # But ONLY if the label doesn't contain "Gross Income (Primary)"
    
    # Split content by lines to process more safely
    lines = content.split('\n')
    new_lines = []
    
    for line in lines:
        if 'Gross Income (Primary)' in line or 'income_gross' in line:
            new_lines.append(line)
        else:
            # remove span
            new_line = line.replace('<span class="text-red-500">*</span> ', '')
            new_line = new_line.replace('<span class="text-red-500">*</span>', '')
            
            # remove required attribute from input if present
            # matching `required min=` or just `required`
            new_line = re.sub(r'\brequired\b\s*', '', new_line)
            
            new_lines.append(new_line)
            
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))

if __name__ == '__main__':
    process_html('index.html')
