import { useMemo } from 'react';
import { Box } from '@mui/material';

interface FadeInTextProps {
  text: string;
  delay?: number;
}

export default function FadeInText({ text, delay = 20 }: FadeInTextProps) {
  // 1) Turn literal "\n" into real newlines
  const normalisedText = useMemo(
    () => text.replace(/\\n/g, '\n'),
    [text]
  );

  // 2) Split and keep whitespace tokens
  const tokens = useMemo(
    () => normalisedText.split(/(\s+)/),
    [normalisedText]
  );

  return (
    <Box component="span" sx={{ display: 'inline' }}>
      {tokens.map((token, index) => {
        // newline(s)
        if (token === '\n') {
          return <br key={index} />;
        }

        // multiple newlines (e.g. "\n\n")
        if (/^\n+$/.test(token)) {
          return (
            <span key={index}>
              {token.split('').map((_, i) => (
                <br key={i} />
              ))}
            </span>
          );
        }

        // plain whitespace (spaces / tabs)
        if (/^\s+$/.test(token)) {
          return <span key={index}>{token}</span>;
        }

        // everything else = actual "word" token
        const firstThree = token.slice(0, 3);
        const lastThree = token.slice(-3);

        // emphasis: **key**
        if (firstThree.includes("**") || lastThree.includes("**")) {
          const cleaned = token.replaceAll("**", "");
          return (
            <Box
              key={index}
              component="span"
              sx={{
                display: 'inline-block',
                opacity: 0,
                fontWeight: 700,
                color: '#ff6b35',
                animation: 'fadeInWord 0.3s ease-in forwards',
                animationDelay: `${index * (delay / 1000)}s`,
                '@keyframes fadeInWord': {
                  from: {
                    opacity: 0,
                    transform: 'translateY(5px)',
                  },
                  to: {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
              }}
            >
              {cleaned}
            </Box>
          );
        }

        // key noun: <<AV-123>>
        if (firstThree.includes("<<") || lastThree.includes(">>")) {
          const cleaned = token.replaceAll("<<", "").replaceAll(">>", "");
          return (
            <Box
              key={index}
              component="span"
              sx={{
                display: 'inline-block',
                opacity: 0,
                fontWeight: 600,
                color: '#ff8c42',
                backgroundColor: 'rgba(255, 140, 66, 0.1)',
                padding: '2px 6px',
                borderRadius: '4px',
                animation: 'fadeInWord 0.3s ease-in forwards',
                animationDelay: `${index * (delay / 1000)}s`,
                '@keyframes fadeInWord': {
                  from: {
                    opacity: 0,
                    transform: 'translateY(5px)',
                  },
                  to: {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
              }}
            >
              {cleaned}
            </Box>
          );
        }

        // normal word
        return (
          <Box
            key={index}
            component="span"
            sx={{
              display: 'inline-block',
              opacity: 0,
              animation: 'fadeInWord 0.3s ease-in forwards',
              animationDelay: `${index * (delay / 1000)}s`,
              '@keyframes fadeInWord': {
                from: {
                  opacity: 0,
                  transform: 'translateY(5px)',
                },
                to: {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              },
            }}
          >
            {token}
          </Box>
        );
      })}
    </Box>
  );
}
