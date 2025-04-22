import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button,
  CircularProgress,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DownloadIcon from '@mui/icons-material/Download';

const WhitepaperContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(8),
  '& img': {
    maxWidth: '100%',
    height: 'auto',
    margin: `${theme.spacing(4)} auto`,
    display: 'block',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    borderRadius: theme.shape.borderRadius,
  },
  '& table': {
    width: '100%',
    borderCollapse: 'collapse',
    margin: `${theme.spacing(4)} 0`,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
  },
  '& th, & td': {
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1.5),
    textAlign: 'left',
  },
  '& th': {
    backgroundColor: theme.palette.background.default,
    fontWeight: 'bold',
  },
  '& pre': {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    overflowX: 'auto',
    margin: `${theme.spacing(3)} 0`,
  },
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    color: theme.palette.primary.main,
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
    fontWeight: 600,
  },
  '& p': {
    marginBottom: theme.spacing(2.5),
    lineHeight: 1.7,
    fontSize: '1.05rem',
  },
  '& ul, & ol': {
    paddingLeft: theme.spacing(4),
    marginBottom: theme.spacing(3),
  },
  '& li': {
    marginBottom: theme.spacing(1),
    lineHeight: 1.6,
  }
}));

const TableOfContents = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(5),
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 3px 6px rgba(0,0,0,0.05)',
  '& ul': {
    paddingLeft: theme.spacing(3),
    marginTop: theme.spacing(2),
  },
  '& li': {
    margin: `${theme.spacing(1.5)} 0`,
    fontSize: '1.05rem',
  },
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    fontWeight: 500,
    '&:hover': {
      textDecoration: 'underline',
    }
  }
}));

const DownloadButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  padding: `${theme.spacing(1)} ${theme.spacing(2.5)}`,
  fontWeight: 600,
  [theme.breakpoints.down('sm')]: {
    position: 'static',
    display: 'block',
    margin: `${theme.spacing(2)} 0`,
  }
}));

// Improved markdown to HTML converter with better spacing
const convertMarkdownToHtml = (markdown) => {
  if (!markdown) return '';
  
  // Process code blocks first
  let html = markdown.replace(/```([^`]+)```/g, '<pre>$1</pre>');
  
  // Process headers with more spacing
  html = html
    .replace(/# (.*)/g, '<h1 id="$1" class="section-title">$1</h1>')
    .replace(/## (.*)/g, '<h2 id="$1" class="section-subtitle">$1</h2>')
    .replace(/### (.*)/g, '<h3 id="$1" class="section-subheading">$1</h3>')
    .replace(/#### (.*)/g, '<h4 id="$1" class="section-subsubheading">$1</h4>');

  // Process emphasis and links
  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="whitepaper-link">$1</a>');
  
  // Enhance image display
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, 
    '<div class="image-container"><img alt="$1" src="$2" class="whitepaper-image"><div class="image-caption">$1</div></div>');

  // Process tables with better formatting
  html = html.replace(/\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|/g, 
    '<tr><td>$1</td><td>$2</td><td>$3</td><td>$4</td></tr>');
  
  // Style bullet points better
  const bulletPointPattern = /^[-*] (.*)$/gm;
  html = html.replace(bulletPointPattern, '<li class="enhanced-bullet">$1</li>');
  
  // Convert lists
  html = html.replace(/<li class="enhanced-bullet">(.*?)<\/li>(\s*<li class="enhanced-bullet">)/g, 
    '<li class="enhanced-bullet">$1</li>$2');
  html = html.replace(
    /(<li class="enhanced-bullet">.*?<\/li>)(?!\s*<li class="enhanced-bullet">)/gs, 
    '<ul class="enhanced-list">$1</ul>'
  );
  
  // Process paragraphs with better spacing
  html = html.replace(/\n\n/g, '</p><p class="whitepaper-paragraph">');
  html = html.replace(/^(.+)(?!\<)/, '<p class="whitepaper-paragraph">$1</p>');
  
  return html;
};

// Extract table of contents from markdown
const extractTableOfContents = (markdown) => {
  const headings = [];
  const regex = /^(#+)\s+(.+)$/gm;
  let match;

  while ((match = regex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2];
    headings.push({ level, text });
  }

  return headings;
};

function Whitepaper() {
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableOfContents, setTableOfContents] = useState([]);

  useEffect(() => {
    fetch('/whitepaper-enhanced.md')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load whitepaper');
        }
        return response.text();
      })
      .then(text => {
        setMarkdown(text);
        // Extract table of contents and only keep levels 1 and 2
        const allHeadings = extractTableOfContents(text);
        const filteredHeadings = allHeadings.filter(heading => heading.level <= 2);
        setTableOfContents(filteredHeadings);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading whitepaper:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const renderTableOfContents = () => {
    if (tableOfContents.length === 0) return null;

    return (
      <TableOfContents elevation={2}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Table of Contents
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <ul>
          {tableOfContents.map((heading, index) => (
            <li 
              key={index} 
              style={{ 
                marginLeft: `${(heading.level - 1) * 16}px`,
                listStyleType: heading.level === 1 ? 'disc' : (heading.level === 2 ? 'circle' : 'square')
              }}
            >
              <a href={`#${heading.text}`}>{heading.text}</a>
            </li>
          ))}
        </ul>
      </TableOfContents>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', py: 12 }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 3 }}>
          Loading whitepaper...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', py: 12 }}>
        <Typography variant="h5" color="error" gutterBottom>
          Error Loading Whitepaper
        </Typography>
        <Typography variant="body1">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <WhitepaperContainer maxWidth="lg">
      <Box position="relative" mb={6}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          Popular Vote Coin Whitepaper
        </Typography>
        <Typography variant="h6" color="text.secondary" mb={3}>
          Version 1.2 | Conceptual Demonstration
        </Typography>
        <DownloadButton 
          variant="contained" 
          color="primary" 
          startIcon={<DownloadIcon />}
          href="/whitepaper-enhanced.pdf"
          target="_blank"
          size="large"
        >
          Download PDF
        </DownloadButton>
      </Box>
      
      <Divider sx={{ my: 4 }} />
      
      {renderTableOfContents()}
      
      <Box 
        dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(markdown) }} 
        sx={{ 
          typography: 'body1',
          '& .section-title': { 
            typography: 'h4', 
            mt: 6, 
            mb: 3, 
            pb: 1, 
            borderBottom: '1px solid rgba(0,0,0,0.1)',
            fontWeight: 700
          },
          '& .section-subtitle': { 
            typography: 'h5', 
            mt: 4, 
            mb: 2,
            fontWeight: 600,
            color: theme => theme.palette.primary.dark
          },
          '& .section-subheading': { 
            typography: 'h6', 
            mt: 3, 
            mb: 2,
            fontWeight: 600 
          },
          '& .whitepaper-paragraph': {
            mb: 2.5,
            lineHeight: 1.7
          },
          '& .enhanced-list': {
            mt: 2,
            mb: 3,
            pl: 4
          },
          '& .enhanced-bullet': {
            mb: 1.5,
            lineHeight: 1.6
          },
          '& .image-container': {
            my: 4,
            textAlign: 'center'
          },
          '& .whitepaper-image': {
            maxWidth: '100%',
            borderRadius: 1,
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          },
          '& .image-caption': {
            mt: 1,
            color: 'text.secondary',
            fontStyle: 'italic'
          }
        }}
      />
    </WhitepaperContainer>
  );
}

export default Whitepaper; 