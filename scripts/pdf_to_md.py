import pymupdf4llm
import os

def convert_templates():
    regions = ["malaysia", "singapore", "hong-kong"]
    
    base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "hr-templates"))
    
    for region in regions:
        source_path = os.path.join(base_path, region)
        blueprint_path = os.path.join(source_path, "blueprints")
        
        if not os.path.exists(source_path):
            print(f"Skipping {region}: Folder not found at {source_path}")
            continue
            
        if not os.path.exists(blueprint_path):
            os.makedirs(blueprint_path)
            print(f"Created folder: {blueprint_path}")
            
        for file in os.listdir(source_path):
            if file.endswith(".pdf"):
                md_filename = file.replace(".pdf", ".md")
                save_to = os.path.join(blueprint_path, md_filename)
                
                if os.path.exists(save_to) and os.path.getsize(save_to) > 0:
                    print(f"Skipping {file} (Blueprint already exists)")
                    continue

                print(f"Converting: {region} -> {file}")
                try:
                    md_text = pymupdf4llm.to_markdown(os.path.join(source_path, file))
                    
                    with open(save_to, "w", encoding="utf-8") as f:
                        f.write(md_text)
                    print(f"   [SUCCESS] Saved to: {md_filename}")
                except Exception as e:
                    print(f"   [FAILED] {file}: {e}")

if __name__ == "__main__":
    convert_templates()