import { useState, useCallback, useRef } from 'react';
import {Container, Box, Typography, Paper, Alert, CssBaseline, ThemeProvider, createTheme, IconButton} from '@mui/material';
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

// APIs
import { uploadQuick, uploadFull, getCurrentAnalysis } from './api/virustotal.api';
import { selectFile } from './api/files_api';
import { getAISummary } from './api/ai.api';


import { buildFileContext, buildAnalysisContext } from './utils/contextExtractor';
import { getFileExtension } from './utils/formatters';

// Types
import type {UploadMode, FileHistoryItem, FileResponse, FileContext, AnalysisContext, ScanResult, APIResponse, AnalysisObject, FileObject,} from './types';

function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState(true);

  // Upload state
  const [uploadMode, setUploadMode] = useState<UploadMode>('quick');
  const [uploading, setUploading] = useState(false);

  // Results state
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [currentFilename, setCurrentFilename] = useState<string | null>(null);
  const [currentUUID, setCurrentUUID] = useState<string>("");

  // File history
  const [fileHistory, setFileHistory] = useState<FileHistoryItem[]>([]);

  // AI Summary
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  // Refresh state
  const [refreshing, setRefreshing] = useState(false);

  const isAnalysisComplete = useRef<boolean>(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Theme
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


  // Handle file upload
  const handleFileUpload = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);

      try {
        if (uploadMode === 'quick') {
          // Quick scan
          const response : APIResponse<FileResponse> = await uploadQuick(file); //An API Response, where the result attribute is FileResponse object
          const fileResponseBody : FileResponse = response.result;

          // Extract UUID from file ID
          const uuid = fileResponseBody.uuid;
          const filename = fileResponseBody.filename;

          // Update state
          setCurrentResult(fileResponseBody.result as FileObject);
          setCurrentFilename(filename);
          setCurrentUUID(uuid);

          setFileHistory((prev) => [
            {
              uuid,
              filename,
              timestamp: Date.now(),
              fileType: getFileExtension(filename),
              scanMode: 'quick',
            },
            ...prev.filter((f) => f.uuid !== uuid),
          ]);

        } 
        else {

          // Full scan
          const response = await uploadFull(file);
          const fullAnalysisResponseBody = response.result;

          const bFoundInPastScans = fullAnalysisResponseBody.found;
          const uuid = fullAnalysisResponseBody.uuid;
          const filename = fullAnalysisResponseBody.filename;

          //If there is a past full scan result for this particular file, show it!
          if (bFoundInPastScans && fullAnalysisResponseBody.result as AnalysisObject){
            setCurrentResult(fullAnalysisResponseBody.result as AnalysisObject);
          }

          else {
            // Otherwise, the file has been uploaded to virus total. Returned in analysis id to query its progress.
            const analysisObjectResponse = await getCurrentAnalysis(uuid);
            setCurrentResult(analysisObjectResponse.result as AnalysisObject);
          }
          
          setCurrentFilename(filename);
          setCurrentUUID(uuid);

          setFileHistory((prev) => [
            {
              uuid,
              filename,
              timestamp: Date.now(),
              fileType: getFileExtension(filename),
              scanMode: 'quick',
            },
            ...prev.filter((f) => f.uuid !== uuid),
          ]);

        }
      } catch (error: any) {
        console.error('Upload error:', error);
        setError(error.response?.data?.detail || 'Failed to upload file. Please try again.');
      } finally {
        setUploading(false);
      }
    },
    [uploadMode]
  );

  // Handle file selection from history
  const handleSelectFile = useCallback(async (uuid: string) => {
    setError(null);
    setCurrentUUID(uuid);

    try {
      const result = await selectFile(uuid);
      setCurrentResult(result);

      // Extract filename from result if possible
      // if ('attributes' in result) {
      //   if (result.type === 'file') {
      //     setCurrentFilename((result as FileResponse).attributes.meaningful_name || null);
      //   }
      // }
    } catch (error: any) {
      console.error('Select file error:', error);
      setError('Failed to load file data. Please try again.');
    }
  }, []);

  // Over here, handle when the user clicks the refresh button to get latest analysis status (for full upload)
  const handleRefreshAnalysis = useCallback(async () => {
    if (!currentFilename) return;

    setError(null);
    setRefreshing(true);

    try {
      const response = await getCurrentAnalysis(currentUUID);
      setCurrentResult(response.result);
    } catch (error: any) {
      console.error('Refresh error:', error);
      setError('Failed to refresh analysis. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, [currentFilename]);




  // Handle AI summary
  const handleAISummary = useCallback(async () => {
    setError(null);
    setLoadingAI(true);

    try {
      const response = await getAISummary();
      setAiSummary(response.result);
      setShowAIModal(true);
    } catch (error: any) {
      console.error('AI summary error:', error);
      setError('Failed to generate AI summary. Please try again.');
    } finally {
      setLoadingAI(false);
    }
  }, []);



  // Determine if analysis is complete
  if(currentResult){
    if(currentResult.type === 'file'){ //It is a file object. So automatically set analysis complete to true. It is not queued like the full upload case.
      isAnalysisComplete.current = true;
    }
    else if(currentResult.type === 'analysis' && (currentResult as AnalysisObject).attributes.status === 'completed'){
      isAnalysisComplete.current = true;
    }
  } //Else, it will remain as false and we will just show "No results" for hash-based upload window, or "Get latest" for full upload window.



  // Extract context for display
  let fileContext: FileContext | null = null;
  let analysisContext: AnalysisContext | null = null;

  if ((currentResult)) {
    switch(currentResult.type){
      case "file":
        fileContext = buildFileContext(currentResult as FileObject);
        break;
      case "analysis":
        analysisContext = buildAnalysisContext(currentResult as AnalysisObject);
        break;
      default:
        throw new Error("Unexpected value for <type> attribute of FileObject or AnalysisObject")
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
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Upload Section */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            📤 Upload File
          </Typography>
          <UploadModeToggle mode={uploadMode} onChange={setUploadMode} />
          <FileDropzone onFileSelect={handleFileUpload} mode={uploadMode} loading={uploading} />
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
              refreshing={refreshing}
              canShowAISummary={isAnalysisComplete.current}
              loadingAI={loadingAI}
            />
          </Box>
        )}

        {/* File History */}
        <FileHistoryList
          history={fileHistory}
          onSelectFile={handleSelectFile}
          selectedUUID={currentUUID}
        />

        {/* AI Summary Modal */}
        <AISummaryModal open={showAIModal} onClose={() => setShowAIModal(false)} summary={aiSummary} />
      </Container>
    </ThemeProvider>
  );
}

export default App;