#!/bin/bash

# Files to process
FILES=("ewd426.qnt" "ewd426_3.qnt" "ewd426_4.qnt")

# Apalache jar path
APALACHE_JAR="$HOME/.quint/apalache-dist-0.47.2/apalache/lib/apalache.jar"

# Memory options for Java
JAVA_OPTS="-Xmx8G -Xss515m"

for file in "${FILES[@]}"; do
    base_name="${file%.qnt}"
    tla_file="${base_name}.tla"
    cfg_file="${base_name}.cfg"

    echo "Processing $file..."

    # Step 1: Compile the .qnt file to .tla
    quint compile --target=tlaplus "$file" --temporal=convergence,closure,persistence --invariant=tokenInv > "$tla_file"

    if [[ $? -ne 0 ]]; then
        echo "Error: Compilation failed for $file"
        exit 1
    fi

    if [[ $? -ne 0 ]]; then
        echo "Error: Failed to edit $tla_file"
        exit 1
    fi

    # Step 2: Create the .cfg file
    cat <<EOF > "$cfg_file"
INIT
q_init

NEXT
q_step

PROPERTY
q_temporalProps

INVARIANT
q_inv
EOF

    # Step 3: Run TLC with the required Apalache lib files and check output
    output=$(java $JAVA_OPTS -cp "$APALACHE_JAR" tlc2.TLC -deadlock "$tla_file" 2>&1)

    # Step 4: Delete the generated .tla and .cfg files
    rm -f "$tla_file" "$cfg_file"

    if echo "$output" | grep -q "Model checking completed. No error has been found."; then
        echo "Model checking succeeded for $tla_file"
    else
        echo "Error: Model checking failed for $tla_file"
        echo "$output"
        exit 1
    fi

done

echo "All files processed successfully."
