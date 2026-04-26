#!/bin/bash
cd "$(dirname "$0")"

# Kill any existing expo/metro process on port 8081
lsof -ti :8081 | xargs kill -9 2>/dev/null
pkill -f "expo start" 2>/dev/null
sleep 1

# Start expo in background, log to file
nohup npx expo start --clear > /tmp/expo-coherence.log 2>&1 &
echo "Expo started (PID $!). Log: /tmp/expo-coherence.log"
echo "Waiting for Metro to be ready..."
sleep 5
echo "Done. You can close this window."
