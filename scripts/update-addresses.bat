@echo off
:: DePIN Uptime Platform - Update Contract Addresses Script
:: This batch file runs the update-addresses.js script

echo Running Update Contract Addresses Script...
node scripts/update-addresses.js %*
if %ERRORLEVEL% NEQ 0 (
  echo Script failed with error level %ERRORLEVEL%
  exit /b %ERRORLEVEL%
)
echo Script completed successfully. 