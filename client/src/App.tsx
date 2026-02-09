import { useState, useCallback } from 'react';
import {Container,Box,Typography,Paper, Alert,CssBaseline,ThemeProvider,createTheme,IconButton
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SecurityIcon from '@mui/icons-material/Security';

// Components
import UploadModeToggle from './components/UploadSection/UploadModeToggle';
import FileDropzone from './components/UploadSection/FileDropzone';
import StatusBadge from './components/ResultsPanel/StatusBadge';
import FileInfo from './components/ResultsPanel/FileInfo';
import AnalysisInfo from './components/ResultsPanel/AnalysisInfo';
import ScanStatsChart from './components/ResultsPanel/ScanStatsChart';
import ActionButtons from './components/ResultsPanel/ActionButtons';
import AISummaryModal from './components/ResultsPanel/AISummaryModal';
import FileHistoryList from './components/FileHistory/FileHistoryList';
import Popup from './components/Popup';

// Hooks
import { useFileHistory } from './hooks/useFileHistory';
import { useUpload } from './hooks/useUpload';
import { useAnalysis } from './hooks/useAnalysis';
import { useAISummary } from './hooks/useAISummary';
import { useResultContext } from './hooks/useResultContext';
import { useSelectFile } from './hooks/useSelectFile';

// Utils
import { getFileExtension } from './utils/formatters';

// Types
import {
  type ScanResult,
  type AnalysisObject,
  type FileObject,
  type FileContext,
  type UploadMode
} from './types';

function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState(true);

  // Results state
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [currentUUID, setCurrentUUID] = useState<string>('');
  const [currentfilename, setCurrentFilename] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<UploadMode>("full");

  // Popup state
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupSeverity, setPopupSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  // Custom hooks
  const { history, addFile } = useFileHistory();
  const upload = useUpload(uploadMode);
  const analysis = useAnalysis(currentResult, currentUUID);
  const ai = useAISummary();
  const resultContext = useResultContext(currentResult, currentfilename);
  const fileSelector = useSelectFile();


  //For theme
  const theme = createTheme({
    typography: {
      fontFamily: ['Saira',].join(','),
    },
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

  // Here, we use a useCallBack() 
  // to make sure that we reuse the same results of the function for the same arugment values, unless they change 
  // --> then we will proceed to invoke its inner mechanisms.


  // Handle file upload
  const handleFileUpload = useCallback(
    async (file: File) => {
      setError(null);
      try {
        const result = await upload.uploadFile(file);
        
        if (result.fileNotFound){
          const message = result.message || 'File not found in VirusTotal database. Please try a full scan instead.';
          setPopupMessage(message);
          setPopupSeverity('warning');
          setPopupOpen(true);
          return;
        }

        //Else if information can be retrieved about the file via its hash..
        setCurrentResult(result.result);
        setCurrentUUID(result.uuid);
        setCurrentFilename(result.filename);

        //Add to history over here (In-memory list)
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
    async (uuid: string, filename : string) => {
      setError(null);
      setCurrentUUID(uuid);
      setCurrentFilename(filename);

      const response = await fileSelector.selectFileByUUID(uuid, filename);

      if ('error' in response) {
        setError(response.error);
        return;
      }

      const { result, mode} = response;
      setCurrentResult(result as ScanResult);

      addFile({
        uuid,
        filename,
        timestamp: Date.now(),
        fileType: getFileExtension(filename),
        scanMode: mode,
      });
    },
    [fileSelector, addFile, setUploadMode]
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

  
  const handleUploadModeChange = useCallback(async (mode: UploadMode) => {
    setUploadMode(mode);
  }, []);

  return (
    <>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
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
          <UploadModeToggle mode={uploadMode} onChange={handleUploadModeChange} />
          <FileDropzone onFileSelect={handleFileUpload} mode={uploadMode} loading={upload.uploading} />
        </Paper>

        {/* Results Panel */}
        {currentResult && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              🧪 Scan Results
            </Typography>

            {/* Success Message */}
            <Alert severity="success" sx={{ mb: 2 }}>
              💻 Upload successful!
            </Alert>

            {/* File Object Results */}
            {resultContext.isFile && resultContext.file as FileContext &&  resultContext.file &&(
              <>
                <FileInfo 
                file={resultContext.file}
                />
                {(resultContext.raw as FileObject).attributes.last_analysis_stats && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Status:
                      </Typography>
                      <StatusBadge status="completed" />
                    </Box>

                    <ScanStatsChart
                    stats={(resultContext.raw as FileObject).attributes.last_analysis_stats!}
                    threatLevel={resultContext.file.detections.threatLevel}
                    engineResults={
                      (resultContext.raw as FileObject).attributes.last_analysis_results
                    }
                  />
                  </Box>
                )}
              </>
            )}

            {/* Analysis Object Results */}
            {resultContext.isAnalysis && resultContext.analysis && (
              <Box>
                <AnalysisInfo
                  analysis={resultContext.analysis}
                />

                {resultContext.analysis.status.state === 'completed' && (
                  <ScanStatsChart 
                    stats={(resultContext.raw as AnalysisObject).attributes.stats}
                    threatLevel={resultContext.analysis.detections.threatLevel}
                    engineResults={
                      (resultContext.raw as AnalysisObject).attributes.results
                    }
                  />
                )}

                {resultContext.analysis.status.state !== 'completed' && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Analysis in progress... Click "Refresh Analysis" to check for updates.
                  </Alert>
                )}
              </Box>
            )}

            {/* Action Buttons */}
            <ActionButtons
              currentMode={uploadMode}
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
        
        {/* Popup Notification */}
        <Popup
          open={popupOpen}
          message={popupMessage}
          severity={popupSeverity}
          onClose={() => setPopupOpen(false)}
        />
      </Container>
    </ThemeProvider>
    </>
  );
}

export default App;
