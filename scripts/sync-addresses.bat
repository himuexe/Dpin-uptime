@echo off
:: DePIN Uptime Platform - Sync Contract Addresses Script
:: This batch file runs the sync-addresses.js script

echo Running Contract Address Synchronization Script...
node scripts/sync-addresses.js %*
if %ERRORLEVEL% NEQ 0 (
  echo Script failed with error level %ERRORLEVEL%
  exit /b %ERRORLEVEL%
)
echo Script completed successfully. 