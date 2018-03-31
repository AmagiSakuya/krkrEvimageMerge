@echo off
for %%i in (*.txt) do node merge.js "%%i"
pause