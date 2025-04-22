# PowerShell script to generate PDF from markdown

Write-Host "Generating PDF whitepaper..." -ForegroundColor Green

# Directory paths
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$rootDir = Split-Path -Parent $scriptDir
$publicDir = Join-Path -Path $rootDir -ChildPath "public"
$imagesDir = Join-Path -Path $publicDir -ChildPath "images"

# Input and output files
$inputFile = Join-Path -Path $publicDir -ChildPath "whitepaper-enhanced.md"
$outputFile = Join-Path -Path $publicDir -ChildPath "whitepaper-enhanced.pdf"

# Check if the input file exists
if (-not (Test-Path $inputFile)) {
    Write-Host "Error: Input file $inputFile not found." -ForegroundColor Red
    exit 1
}

# Check for pandoc
try {
    $pandocVersion = pandoc --version
    Write-Host "Found pandoc: $($pandocVersion[0])" -ForegroundColor Green
} catch {
    Write-Host "Error: pandoc is not installed. Please install pandoc first." -ForegroundColor Red
    Write-Host "Visit https://pandoc.org/installing.html for installation instructions."
    exit 1
}

# Create a CSS file for styling
$cssFile = Join-Path -Path $publicDir -ChildPath "whitepaper-pdf.css"
@"
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
"@ | Out-File -FilePath $cssFile -Encoding utf8

# Generate PDF using pandoc
Write-Host "Running pandoc to generate PDF..." -ForegroundColor Yellow
$date = Get-Date -Format "MMMM yyyy"

try {
    pandoc $inputFile `
        -o $outputFile `
        --pdf-engine=wkhtmltopdf `
        --css=$cssFile `
        --highlight-style=tango `
        -V margin-top=25mm `
        -V margin-right=25mm `
        -V margin-bottom=25mm `
        -V margin-left=25mm `
        -V papersize=a4 `
        -V title="Popular Vote Platform Whitepaper" `
        -V author="Popular Vote Team" `
        --metadata=date:$date

    if (Test-Path $outputFile) {
        Write-Host "PDF generated successfully: $outputFile" -ForegroundColor Green
    } else {
        Write-Host "Error: Failed to generate PDF." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "If you're seeing PDF engine errors, make sure wkhtmltopdf is installed." -ForegroundColor Yellow
    Write-Host "Visit https://wkhtmltopdf.org/downloads.html to download it." -ForegroundColor Yellow
    exit 1
}

Write-Host "Complete." -ForegroundColor Green 