# Popular Vote Platform Whitepaper

## Overview

This directory contains the Popular Vote Platform whitepaper in multiple formats:

- `whitepaper.md`: Original markdown version
- `whitepaper.html`: HTML version for web viewing
- `whitepaper-enhanced.md`: Enhanced version with more technical details
- `whitepaper-enhanced.pdf`: PDF version for distribution

## Generating the PDF

The PDF version requires [pandoc](https://pandoc.org/) and [wkhtmltopdf](https://wkhtmltopdf.org/) to be generated.

### For Unix/Linux/Mac users:

```bash
npm run generate-whitepaper
```

### For Windows users:

```bash
npm run generate-whitepaper:win
```

## Modifying the Whitepaper

When making changes to the whitepaper content:

1. Edit the `whitepaper-enhanced.md` file
2. Regenerate the PDF using the commands above
3. Update any images in the `images` directory
4. Test the PDF output for correct rendering

## Images

The following images are used in the whitepaper and should be maintained:

- `system-architecture.svg`: System architecture diagram
- `token-distribution.svg`: Token distribution pie chart
- Additional images as specified in the `images/README.md` file

## Adding the Whitepaper to the Website

The whitepaper is already integrated with the website:

1. The main navigation includes a "Whitepaper" link
2. This link goes to `whitepaper-download.html`
3. From there, users can download the PDF or view the HTML version

## Best Practices

- Keep the whitepaper technically accurate and up-to-date
- Ensure all diagrams follow the platform's color palette
- Maintain consistent styling across all formats
- Regular updates should have clear version numbering
- Previous versions should be archived in a separate directory

## Further Information

For questions about the whitepaper, please contact the documentation team. 