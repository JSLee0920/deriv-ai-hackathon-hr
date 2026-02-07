import pymupdf4llm
import os

def convert_templates():
    regions = ["malaysia", "singapore", "indonesia"]
    
    for region in regions:
        source_path = f"hr-templates/{region}/"
        if not os.path.exists(source_path):
            print(f"Source path {source_path} does not exist.")
            continue
        
        for file in os.listdir(source_path):
            if file.endswith(".pdf"):
                print(f"Converting {region} template: {file}")
                
                # Convert PDF to Markdown
                md_text = pymupdf4llm.to_markdown(os.path.join(source_path, file))
                
                with open(os.path.join(source_path, file.replace(".pdf", ".md")), "w") as f:
                    f.write(md_text)

if __name__ == "__main__":
    convert_templates()