@echo off
chcp 65001 >nul
title 轻量企业客服工单系统 - 启动器
echo ============================================================
echo   轻量企业客服工单系统（Vue3 + NestJS + MySQL）
echo   前端地址: http://127.0.0.1:5173
echo   后端地址: http://127.0.0.1:3000/api/v1
echo   关闭窗口即停止对应服务
echo ============================================================
start "工单系统-后端(3000)" cmd /k "cd /d %~dp0server && npm start"
start "工单系统-前端(5173)" cmd /k "cd /d %~dp0web && npm run dev"
echo 服务启动中，请稍候，然后浏览器访问 http://127.0.0.1:5173
pause
