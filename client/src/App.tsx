import { useState, useCallback } from 'react';
import {Container,Box,Typography,Paper, Alert,CssBaseline,ThemeProvider,createTheme,IconButton
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SecurityIcon from '@mui/icons-material/Security';

// Components
import { UploadModeToggle } from './components/UploadSection/UploadModeToggle';
import { FileDropzone } from './components/UploadSection/FileDropzone';
import { StatusBadge } from './components/ResultsPanel/StatusBadge';
import { FileInfo } from './components/ResultsPanel/FileInfo';
import { ScanStatsChart } from './components/ResultsPanel/ScanStatsChart';
import { ActionButtons } from './components/ResultsPanel/ActionButtons';
import { AISummaryModal } from './components/ResultsPanel/AISummaryModal';
import { FileHistoryList } from './components/FileHistory/FileHistoryList';

// Hooks
import { useUploadMode } from './hooks/useUploadMode';
import { useFileHistory } from './hooks/useFileHistory';
import { useUpload } from './hooks/useUpload';
import { useAnalysis } from './hooks/useAnalysis';
import { useAISummary } from './hooks/useAiSummary';

// APIs
import { selectFile } from './api/files_api';

// Utils
import { buildFileContext, buildAnalysisContext } from './utils/contextExtractor';
import { getFileExtension } from './utils/formatters';

// Types
import type {
  FileContext,
  AnalysisContext,
  ScanResult,
  AnalysisObject,
  FileObject,
  SavedFileResultsResponse
} from './types';

function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState(true);

  // Results state
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [currentUUID, setCurrentUUID] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Custom hooks
  const { uploadMode, toggleUploadMode } = useUploadMode();
  const { history, addFile } = useFileHistory();
  const upload = useUpload(uploadMode);
  const analysis = useAnalysis(currentResult, currentUUID);
  const ai = useAISummary();

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      success: {
        main: '#4caf50',
      },
      warning: {
        main: '#ff9800',
      },
      error: {
        main: '#f44336',
      },
    },
  });

  // Handle upload mode change
  const handleModeChange = useCallback(
    async (mode: 'quick' | 'full', toFetch: boolean) => {
      const response = await toggleUploadMode(mode, toFetch);
      if (response?.result) {
        setCurrentResult(response.result);
      }
    },
    [toggleUploadMode]
  );

  // Handle file upload
  const handleFileUpload = useCallback(
    async (file: File) => {
      setError(null);
      try {
        const result = await upload.uploadFile(file);
        setCurrentResult(result.result);
        setCurrentUUID(result.uuid);

        addFile({
          uuid: result.uuid,
          filename: result.filename,
          timestamp: Date.now(),
          fileType: getFileExtension(result.filename),
          scanMode: uploadMode,
        });
      } catch (error: any) {
        setError(error.message || 'Failed to upload file');
      }
    },
    [upload, uploadMode, addFile]
  );

  // Handle file selection from history
  const handleSelectFile = useCallback(
    async (uuid: string) => {
      setError(null);
      setCurrentUUID(uuid);

      try {
        const response: SavedFileResultsResponse = await selectFile(uuid);

        if (response.full) {
          await handleModeChange('full', false);
          setCurrentResult(response.full);
        } else if (response.quick) {
          await handleModeChange('quick', false);
          setCurrentResult(response.quick);
        } else {
          setError('Both results from hash-based and full scan are null. Please try again.');
        }
      } catch (error: any) {
        setError('Failed to load file data. Please try again.');
      }
    },
    [handleModeChange]
  );

  // Handle refresh analysis
  const handleRefreshAnalysis = useCallback(async () => {
    setError(null);
    try {
      const updated = await analysis.refresh();
      if (updated) {
        setCurrentResult(updated);
      }
    } catch (error: any) {
      setError('Failed to refresh analysis. Please try again.');
    }
  }, [analysis]);

  // Handle AI summary
  const handleAISummary = useCallback(async () => {
    setError(null);
    try {
      await ai.generate();
    } catch (error: any) {
      setError('Failed to generate AI summary. Please try again.');
    }
  }, [ai]);

  // Extract context for display
  let fileContext: FileContext | null = null;
  let analysisContext: AnalysisContext | null = null;

  if (currentResult) {
    switch (currentResult.type) {
      case 'file':
        fileContext = buildFileContext(currentResult as FileObject);
        break;
      case 'analysis':
        analysisContext = buildAnalysisContext(currentResult as AnalysisObject);
        break;
      default:
        throw new Error('Unexpected value for <type> attribute of FileObject or AnalysisObject');
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SecurityIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Typography variant="h4" component="h1" fontWeight={700}>
              ProtoCyber VT Scanner
            </Typography>
          </Box>
          <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>

        {/* Error Alert */}
        {(error || upload.error) && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
            {error || upload.error}
          </Alert>
        )}

        {/* Upload Section */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            📤 Upload File
          </Typography>
          <UploadModeToggle mode={uploadMode} onChange={handleModeChange} />
          <FileDropzone onFileSelect={handleFileUpload} mode={uploadMode} loading={upload.uploading} />
        </Paper>

        {/* Results Panel */}
        {currentResult && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              📊 Scan Results
            </Typography>

            {/* Success Message */}
            <Alert severity="success" sx={{ mb: 2 }}>
              ✅ Upload successful!
            </Alert>

            {/* File Object Results */}
            {currentResult.type === 'file' && fileContext && (
              <>
                <FileInfo context={fileContext} />
                {fileContext.analysis_summary && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Status:
                      </Typography>
                      <StatusBadge status="completed" />
                    </Box>
                    <ScanStatsChart stats={fileContext.analysis_summary} />
                  </Box>
                )}
              </>
            )}

            {/* Analysis Object Results */}
            {currentResult.type === 'analysis' && analysisContext && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Status:
                  </Typography>
                  <StatusBadge status={analysisContext.analysis_status} />
                </Box>

                {analysisContext.analysis_status === 'completed' && (
                  <ScanStatsChart stats={(currentResult as AnalysisObject).attributes.stats} />
                )}

                {analysisContext.analysis_status !== 'completed' && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Analysis in progress... Click "Refresh Analysis" to check for updates.
                  </Alert>
                )}
              </Box>
            )}

            {/* Action Buttons */}
            <ActionButtons
              onRefresh={handleRefreshAnalysis}
              onAISummary={handleAISummary}
              refreshing={analysis.refreshing}
              canShowAISummary={analysis.isComplete}
              loadingAI={ai.loading}
            />
          </Box>
        )}

        {/* File History */}
        <FileHistoryList
          history={history}
          onSelectFile={handleSelectFile}
          selectedUUID={currentUUID}
        />

        {/* AI Summary Modal */}
        <AISummaryModal open={ai.open} onClose={ai.close} summary={ai.summary} />
      </Container>
    </ThemeProvider>
  );
}

export default App;
