@echo off
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "PATH=%JAVA_HOME%\bin;%PATH%"
cd /d "c:\Users\ttagu\Documents\PlayBeacon-Repos\mobile-app"
call npx expo run:android --port 8090
