#!/bin/bash
cd /home/kavia/workspace/code-generation/recipeshare-platform-225185-225216/backend
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

