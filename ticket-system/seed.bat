@echo off
chcp 65001 >nul
title 工单系统 - 初始化演示数据
echo 正在写入演示数据（已有数据则自动跳过）...
cd /d %~dp0server
call npm run seed
echo.
echo 完成。如需彻底重置，请删除 ticket_system 数据库后重跑本脚本。
pause
