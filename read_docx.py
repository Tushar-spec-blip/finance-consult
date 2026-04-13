import docx
import sys

def main():
    doc_path = sys.argv[1]
    out_path = sys.argv[2]
    doc = docx.Document(doc_path)
    
    with open(out_path, 'w', encoding='utf-8') as f:
        for block in doc.element.body:
            if block.tag.endswith('p'):
                p = docx.text.paragraph.Paragraph(block, doc)
                f.write(p.text + '\n')
            elif block.tag.endswith('tbl'):
                t = docx.table.Table(block, doc)
                for row in t.rows:
                    row_data = []
                    for cell in row.cells:
                        row_data.append(cell.text.replace('\n', ' '))
                    f.write(" | ".join(row_data) + '\n')
                f.write('\n')
            
    print(f"Extraction complete.")

if __name__ == '__main__':
    main()
