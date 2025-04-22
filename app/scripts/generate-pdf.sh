#!/bin/bash

# Script to generate PDF version of the whitepaper
# Requires pandoc and a PDF engine like wkhtmltopdf to be installed

echo "Generating PDF whitepaper..."

# Directory paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
PUBLIC_DIR="$ROOT_DIR/public"
IMAGES_DIR="$PUBLIC_DIR/images"

# Input and output files
INPUT_FILE="$PUBLIC_DIR/whitepaper-enhanced.md"
OUTPUT_FILE="$PUBLIC_DIR/whitepaper-enhanced.pdf"

# Check if pandoc is installed
if ! command -v pandoc &> /dev/null; then
    echo "Error: pandoc is not installed. Please install pandoc first."
    echo "Visit https://pandoc.org/installing.html for installation instructions."
    exit 1
fi

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Input file $INPUT_FILE not found."
    exit 1
fi

# Generate CSS for styling
CSS_FILE="$PUBLIC_DIR/whitepaper-pdf.css"
cat > "$CSS_FILE" << EOF
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    margin: 0;
    padding: 0;
}

h1 {
    color: #1976d2;
    text-align: center;
    font-size: 28pt;
    margin-bottom: 40px;
}

h2 {
    color: #1976d2;
    border-bottom: 2px solid #1976d2;
    padding-bottom: 5px;
    margin-top: 40px;
    font-size: 22pt;
}

h3 {
    color: #2196f3;
    margin-top: 30px;
    font-size: 18pt;
}

h4 {
    color: #0d47a1;
    font-size: 16pt;
}

p {
    margin-bottom: 10px;
    text-align: justify;
}

ul, ol {
    padding-left: 25px;
    margin-bottom: 15px;
}

code {
    background-color: #f5f5f5;
    padding: 2px 5px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
}

pre {
    background-color: #f5f5f5;
    padding: 15px;
    border-radius: 5px;
    overflow-x: auto;
    font-family: 'Courier New', monospace;
}

strong {
    color: #0d47a1;
}

table {
    border-collapse: collapse;
    width: 100%;
    margin: 20px 0;
}

th, td {
    border: 1px solid #ddd;
    padding: 8px 12px;
}

th {
    background-color: #f5f5f5;
    font-weight: bold;
    text-align: left;
}

tr:nth-child(even) {
    background-color: #f9f9f9;
}

img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 20px auto;
}
EOF

# Generate the PDF using pandoc
echo "Running pandoc to generate PDF..."
pandoc "$INPUT_FILE" \
    -o "$OUTPUT_FILE" \
    --pdf-engine=wkhtmltopdf \
    --css="$CSS_FILE" \
    --toc \
    --toc-depth=3 \
    --highlight-style=tango \
    -V margin-top=25mm \
    -V margin-right=25mm \
    -V margin-bottom=25mm \
    -V margin-left=25mm \
    -V papersize=a4 \
    -V title="Popular Vote Platform Whitepaper" \
    -V author="Popular Vote Team" \
    --metadata=date:"$(date +"%B %Y")"

# Check if PDF was generated successfully
if [ $? -eq 0 ] && [ -f "$OUTPUT_FILE" ]; then
    echo "PDF generated successfully: $OUTPUT_FILE"
else
    echo "Error: Failed to generate PDF."
    exit 1
fi

echo "Complete."
exit 0 