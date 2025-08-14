@echo off
echo Cleaning up MenuDeals project files...

cd /d "c:\Users\stefa\Documents\PROJECTS\menudeals"

rem Remove JavaScript test files
del /f /q "add-test-restaurant.js" 2>nul
del /f /q "check-tables.js" 2>nul
del /f /q "console-clear-script.js" 2>nul
del /f /q "setup-database-new.js" 2>nul
del /f /q "setup-database.js" 2>nul
del /f /q "setup-supabase.js" 2>nul
del /f /q "setup-test-restaurant.js" 2>nul
del /f /q "simple-add.js" 2>nul
del /f /q "test-connection.js" 2>nul
del /f /q "test-database.js" 2>nul
del /f /q "test-db-connection.js" 2>nul
del /f /q "test-direct.js" 2>nul
del /f /q "test-location.js" 2>nul

rem Remove SQL files
del /f /q "database-schema.sql" 2>nul
del /f /q "menudeals-setup.sql" 2>nul
del /f /q "setup_database.sql" 2>nul
del /f /q "supabase-setup.sql" 2>nul
del /f /q "update-database-for-admin.sql" 2>nul

rem Remove documentation files
del /f /q "DATABASE_SETUP_GUIDE.md" 2>nul
del /f /q "FRESH_START_PLAN.md" 2>nul
del /f /q "SUPABASE_INTEGRATION_GUIDE.md" 2>nul

rem Remove other files
del /f /q "clear-database.html" 2>nul
del /f /q "dailymealdeals-static.zip" 2>nul
del /f /q "database-setup-helper.sh" 2>nul

echo Cleanup completed!
pause
