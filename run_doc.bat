@echo off

REM Run Django development server
compodoc -p tsconfig.json -s

REM Wait for user to press Enter
set /p exitmsg=Press Enter to exit...

exit