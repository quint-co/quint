#!/usr/bin/env bash

# Find all .qnt files
qnt_files=$(find examples -type f -name "*.qnt")

# Initialize a flag to track if any file fails the check
all_files_valid=true

# Loop through each .qnt file and check its header
for file in $qnt_files; do
  if [[ "$(head -n 1 "$file")" != "// -*- mode: Bluespec; -*-" ]]; then
    echo "File $file does not start with // -*- mode: Bluespec; -*-"
    all_files_valid=false
  fi
done

# If any file failed the check, exit with a non-zero status
if [ "$all_files_valid" = false ]; then
  exit 1
fi
